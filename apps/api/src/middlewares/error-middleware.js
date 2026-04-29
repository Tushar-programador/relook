import { ZodError } from "zod";
import { logger } from "../config/logger.js";
import { ApiError } from "../utils/api-error.js";
import { sendError } from "../utils/api-response.js";

export function notFoundHandler(_req, _res, next) {
  next(new ApiError(404, "Route not found"));
}

export function errorHandler(error, _req, res, _next) {
  if (error instanceof ZodError) {
    return sendError(res, "Validation failed", 400, error.flatten().fieldErrors);
  }

  if (error instanceof ApiError) {
    return sendError(res, error.message, error.statusCode, error.details);
  }

  logger.error("Unhandled error", { message: error.message, stack: error.stack });
  return sendError(res, "Something went wrong", 500);
}