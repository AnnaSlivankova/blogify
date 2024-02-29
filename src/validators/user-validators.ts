import {body} from "express-validator";
import {inputValidationMiddleware} from "../middlewares/input-validation/input-validation-middleware";

const loginValidator = body('login').notEmpty().isString().trim().matches('^[a-zA-Z0-9_-]*$').isLength({
  min: 3,
  max: 10
}).withMessage('Invalid login value')

const passwordValidator = body('password').notEmpty().isString().trim().isLength({
  min: 6,
  max: 20
}).withMessage('Invalid password value')

const emailValidator = body('email').notEmpty().isString().trim().matches(/^[\w\-\.]+@([\w\-]+\.)+[\w\-]{2,4}$/).withMessage('Invalid email value')

const newPasswordValidator = body('newPassword').notEmpty().isString().trim().isLength({
  min: 6,
  max: 20
}).withMessage('Invalid newPassword value')

export const userValidation = () => [loginValidator, passwordValidator, emailValidator, inputValidationMiddleware]

export const emailValidation = () => [emailValidator, inputValidationMiddleware]

export const passwordValidation = () => [newPasswordValidator, inputValidationMiddleware]