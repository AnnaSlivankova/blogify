import {body} from "express-validator";
import {inputValidationMiddleware} from "../middlewares/input-validation/input-validation-middleware";

const nameValidator = body('name').notEmpty().isString().withMessage('Name must be a string').trim().isLength({
  min: 1,
  max: 15
}).withMessage('Invalid name value')

const descriptionValidator = body('description').notEmpty().isString().withMessage('Description must be a string').trim().isLength({
  min: 1,
  max: 500
}).withMessage('Invalid description value')

const nwebsiteUrlValidator = body('websiteUrl').notEmpty().isString().withMessage('WebsiteUrl must be a string').trim().isLength({
  min: 1,
  max: 100
}).matches('^https://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$').withMessage('Invalid websiteUrl value')

export const blogValidation = () => [nameValidator, descriptionValidator, nwebsiteUrlValidator, inputValidationMiddleware]