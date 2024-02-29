import {body} from "express-validator";
import {AuthRepository} from "../repositories/auth/auth-repository";
import {inputValidationMiddleware} from "../middlewares/input-validation/input-validation-middleware";

const emailValidator = body('email').notEmpty().isString().trim().matches(/^[\w\-\.]+@([\w\-]+\.)+[\w\-]{2,4}$/).withMessage('Invalid email value').custom(async (value) => {

  const isEmailExist = await AuthRepository.getSearchedUser(value)

  if (!isEmailExist) {
    return true
  }

  if (isEmailExist.email) {
    throw Error('This email already exists')
  }

  return true
})

const loginValidator = body('login').notEmpty().isString().trim().matches('^[a-zA-Z0-9_-]*$').isLength({
  min: 3,
  max: 10
}).withMessage('Invalid login value').custom(async (value) => {

  const isLoginExist = await AuthRepository.getSearchedUser(value)

  if (!isLoginExist) {
    return true
  }

  if (isLoginExist.login) {
    throw Error('This login already exists')
  }

  return true
})

const passwordValidator = body('password').notEmpty().isString().trim().isLength({
  min: 6,
  max: 20
}).withMessage('Invalid password value')


const isConfirmValidator = body('email').notEmpty().isString().trim().matches(/^[\w\-\.]+@([\w\-]+\.)+[\w\-]{2,4}$/).withMessage('Invalid email value').custom(async (value) => {

  const isEmailConfirm = await AuthRepository.getSearchedUser(value)

  if (isEmailConfirm!.emailConfirmation?.isConfirmed) {
    throw Error('This email was confirmed')
  }

  return true
})


export const credsValidation = () => [emailValidator, loginValidator, passwordValidator, inputValidationMiddleware]