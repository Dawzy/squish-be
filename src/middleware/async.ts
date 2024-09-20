import { RequestHandler, Request, Response, NextFunction } from "express";

// Async wrapper middleware.
const asyncHandler = (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) =>
  Promise
    .resolve(fn(req, res, next))
    .catch(next);

export default asyncHandler;