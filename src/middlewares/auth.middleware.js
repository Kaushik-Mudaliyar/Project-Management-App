import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";
import { userModel } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken || req.headers?.authorization?.split("")[1];
  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }
  try {
    const decodedToken = await jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
    );
    if (!decodedToken) {
      throw new ApiError(400, "Invalid Token");
    }

    const user = await userModel.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(400, "Invalid token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Unauthorized request");
  }
});
