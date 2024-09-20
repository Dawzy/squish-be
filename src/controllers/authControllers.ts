import { RequestHandler } from "express";
import asyncHandler from "../middleware/async.js";
import * as db from "../db/index.js";
import ErrorResponse from "../utils/errorResponse.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import { PASSWORD_STRENGTH_CONFIG, SALT_ROUNDS } from "../utils/authConfig.js";
import verifyPassword from "../utils/verifyPassword.js";
import {
  IUser,
  IRegisterBody,
  ILoginBody,
  IToken,
  IUpdateBody,
  IFieldRow,
  IDeleteBody
} from "../types/index.js";

const register: RequestHandler = asyncHandler(async (req, res, next) => {
  // Get creditentials
  let { firstName, lastName, email, password } = req.body as IRegisterBody;

  // Sanitize
  firstName = validator.escape(firstName);
  lastName = validator.escape(lastName);
  
  // Verify creditentials
  if (!firstName || !lastName || !email || !password)
    return next(new ErrorResponse("Missing field.", 400));
  
  if (!validator.isEmail(email))
    return next(new ErrorResponse("Invalid email.", 400));

  if (!validator.isStrongPassword(password, PASSWORD_STRENGTH_CONFIG))
    return next(new ErrorResponse("Password too weak.", 400));

  // Password salt & hashing
  const hash = await bcrypt.hash(password, SALT_ROUNDS);

  // Query
  const query = "INSERT INTO users(name, surname, email, password, created_at) VALUES($1, $2, $3, $4, NOW()) RETURNING id"
  const values = [firstName, lastName, email, hash]
  const { rows }: { rows: IUser[] } = await db.query(query, values);
  
  const { id } = rows[0];
  
  // Token generation
  const token = await jwt.sign({
    id,
    email,
  }, process.env.JWT_SECRET!);
  
  // Send back token
  res.status(201).json({
    success: true,
    token
  });
});

const login: RequestHandler = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body as ILoginBody;
  const id = await verifyPassword(email, password, next);

  // Token generation
  const token = await jwt.sign({
    id,
    email,
  }, process.env.JWT_SECRET!);
  
  // Send back token
  res.status(200).json({
    success: true,
    token
  });
});

const updateUser: RequestHandler = asyncHandler(async (req, res, next) => {
  const { id, email } = res.locals.tokenBody as IToken;
  let { field, value, altValue } = req.body as IUpdateBody;

  // Check if column exists in database
  const fieldsQuery = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users'"
  const { rows }: { rows: IFieldRow[] } = await db.query(fieldsQuery, []);
  const colExists = rows.find(obj => field === obj.column_name);

  if (!colExists)
    return next(new ErrorResponse("Field does not exist", 400));

  // Validate value
  if (!value)
    return next(new ErrorResponse("No new value specified.", 400));

  // Validate field
  switch (field) {
    case "id":
    case "email":
      return next(new ErrorResponse(`Cannot change ${field} field.`, 400));

    case "password":
      /*
        If it's a password change, verify the new password and authenticate with the old one
      */
      if (!altValue)
        return next(new ErrorResponse("No new password specified.", 400));

      if (!validator.isStrongPassword(altValue, PASSWORD_STRENGTH_CONFIG))
        return next(new ErrorResponse("New password is weak.", 400));

      // Verify old password
      await verifyPassword(email, value, next);

      // Hash new password
      // Set value to alt value, so rest of code works
      value = await bcrypt.hash(altValue, SALT_ROUNDS);
      break;

    case undefined:
      return next(new ErrorResponse("No field specified.", 400));
  }

  // Query the change
  const updateQuery = `UPDATE users SET ${field} = $1 WHERE id = $2`;
  const values = [value, id];

  await db.query(updateQuery, values);

  res.status(200).json({
    success: true
  });
});

const deleteUser: RequestHandler = asyncHandler(async (req, res, next) => {
  const { id, email } = res.locals.tokenBody as IToken;
  const { password } = req.body as IDeleteBody;

  await verifyPassword(email, password, next);

  // Query
  const query = "DELETE FROM users WHERE id = $1";
  const values = [id];
  await db.query(query, values);

  res.status(200).json({
    success: true
  });
});

export {
  register,
  login,
  updateUser,
  deleteUser
};