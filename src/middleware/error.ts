import { ErrorRequestHandler } from "express";
import ErrorResponse from "../utils/errorResponse.js";
import jwt from "jsonwebtoken";
import pg from "pg";

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
	let error: ErrorResponse = { ...err };
  error.message = err.message;

	// Log error
	console.log(err.stack);

  // Handle postgres errors
  if (err instanceof pg.DatabaseError) {
    if (err.code)
      error = new ErrorResponse(`Database error.`, 500);

    if (err.constraint === "accounts_email_key")
      error = new ErrorResponse("Email already exists.", 400);
  }

  // Handle authorization errors
  if (err instanceof jwt.JsonWebTokenError ||
      err instanceof jwt.TokenExpiredError ||
      err instanceof jwt.NotBeforeError)
    error.message = `Invalid token: ${error.message}.`;

	// Return the error object
	res.status(error.statusCode || 500).json({
		success: false,
		error: error.message || "Server error."
	});
}

export default errorHandler;