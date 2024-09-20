import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import ErrorResponse from "../utils/errorResponse.js";
import { IToken } from "../types/index.js"
import asyncHandler from "./async.js";

const authenticate: RequestHandler = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && (authHeader.split(" ")[1] || authHeader.split(" ")[0]);

  if (!token)
    return next(new ErrorResponse("No token provided.", 403));

  const tokenBody = await jwt.verify(token, process.env.JWT_SECRET!) as IToken;

  res.locals.tokenBody = tokenBody; // Token body has id, email, ...
  next();
});

export default authenticate;