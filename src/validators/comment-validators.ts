import {body} from "express-validator";
import {inputValidationMiddleware} from "../middlewares/input-validation/input-validation-middleware";
import {LikesStatuses} from "../models/comment-models/db/comment-db";

const contentValidator = body('content').notEmpty().isString().withMessage('Content must be a string').trim().isLength({
  min: 20,
  max: 300
}).withMessage('Invalid content value')

const likeStatusValidator = body('likeStatus').notEmpty().isIn(Object.values(LikesStatuses)).withMessage('Invalid likeStatus value')

export const commentValidation = () => [contentValidator, inputValidationMiddleware]
export const likeStatusValidation = () => [likeStatusValidator, inputValidationMiddleware]