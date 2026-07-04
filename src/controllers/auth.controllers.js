import { userModel } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { emailVerificationMailgenContent, sendEmail } from "../utils/mail.js";

const options = {
  httpOnly: true,
  secure: true,
};

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await userModel.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while creating access token");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  const existedUser = await userModel.findOne({
    $or: [{ email }, { username }],
  });
  if (existedUser) {
    throw new ApiError(409, "User already exists with email or username");
  }

  const user = await userModel.create({
    email,
    username,
    password,
  });

  const { hashedToken, unhashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}//${req.get("host")}/api/v1/users/verify-email/${unhashedToken}`,
    ),
  });

  const createdUser = await userModel
    .findById(user._id)
    .select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { user: createdUser },
        "User registered successfully",
      ),
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) {
    throw new ApiError(400, "User does not exist with this email");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  const loggedInUser = await userModel
    .findById(user._id)
    .select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken: accessToken,
          refreshToken: refreshToken,
        },
        "User logged in successfully",
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await userModel.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: "",
      },
    },
    {
      returnDocument: "after",
    },
  );
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export { registerUser, loginUser, logoutUser };
