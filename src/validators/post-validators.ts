import {body} from "express-validator";
import {inputValidationMiddleware} from "../middlewares/input-validation/input-validation-middleware";
import {BlogQueryRepository} from "../repositories/blog/blog-query-repository";

const titleValidator = body('title').notEmpty().isString().withMessage('Title must be a string').trim().isLength({
  min: 1,
  max: 30
}).withMessage('Invalid title value')

const shortDescriptionValidator = body('shortDescription').notEmpty().isString().withMessage('Short description must be a string').trim().isLength({
  min: 1,
  max: 100
}).withMessage('Invalid shortDescription value')

const contentValidator = body('content').notEmpty().isString().withMessage('Content description must be a string').trim().isLength({
  min: 1,
  max: 1000
}).withMessage('Invalid content value')

const blogIdValidator = body('blogId').notEmpty().custom(async (value) => {

  const blog = await BlogQueryRepository.getBlogById(value);

  if (!blog) {
    throw Error('Invalid blogId value')
    // return false //или так, тогда в конце обязательно .withMessage('Invalid blogId value')
  }

  return true
})

export const postValidation = () => [titleValidator, shortDescriptionValidator, contentValidator, blogIdValidator, inputValidationMiddleware]

export const createPostFromBlogValidation = () => [titleValidator, shortDescriptionValidator, contentValidator, inputValidationMiddleware]