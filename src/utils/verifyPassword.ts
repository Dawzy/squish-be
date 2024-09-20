import * as db from "../db/index.js";
import bcrypt from "bcrypt";
import ErrorResponse from "./errorResponse.js";
import { NextFunction } from "express";
import IUser from "../types/IUser.js";

const verifyPassword = async (email: string, password: string, next: NextFunction) => {
  // Get account with email
  const query = "SELECT id, email, password FROM users WHERE email = $1";
  const values = [email];
  const { rows }: { rows: IUser[] } = await db.query(query, values);

  // No account exists with the given email
  if (rows.length === 0)
    return next(new ErrorResponse("User does not exist.", 404));

  // Compare passwords
  const { id, password: hashedPassword } = rows[0];
  const isCorrectPassword = await bcrypt.compare(password, hashedPassword);  

  if (!isCorrectPassword)
    return next(new ErrorResponse("Wrong password.", 400));

  return id;
}

export default verifyPassword;