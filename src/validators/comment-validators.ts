import {body} from "express-validator";
import {inputValidationMiddleware} from "../middlewares/input-validation/input-validation-middleware";

const contentValidator = body('content').notEmpty().isString().withMessage('Content must be a string').trim().isLength({
  min: 20,
  max: 300
}).withMessage('Invalid content value')

export const commentValidation = () => [contentValidator, inputValidationMiddleware]