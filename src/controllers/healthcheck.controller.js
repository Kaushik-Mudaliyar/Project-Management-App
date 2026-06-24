import { ApiResponse } from "../utils/apiResponse.js";

const healthCheck = (req, res, next) => {
  try {
    return res
      .status(200)
      .json(new ApiResponse(200, { message: "Server is running" }));
  } catch (error) {
    next(error);
  }
};

export { healthCheck };
