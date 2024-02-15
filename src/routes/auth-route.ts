import {Request, Response, Router} from "express";
import {RequestWithBody} from "../types";
import {LoginInputModel} from "../models/auth-models/input/login-input-model";
import {AuthService} from "../services/auth-service/auth-service";
import {authJwtMiddleware} from "../middlewares/auth/auth-jwt-middleware";
import {emailValidation} from "../validators/user-validators";
import {RegistrationInputModel} from "../models/auth-models/input/registration-input-model";
import {ResendEmailInputModel} from "../models/auth-models/input/resend-email-input-model";
import {credsValidation} from "../validators/auth-validators";
import {ConfirmEmailInputModel} from "../models/auth-models/input/confirmation-email-input-model";
import {AuthMeOutputModel} from "../models/auth-models/output/auth-me-output-model";
import {UserQueryRepository} from "../repositories/user-query-repository";

export const authRoute = Router({})

authRoute.post('/login', async (req: RequestWithBody<LoginInputModel>, res: Response) => {
  const token = await AuthService.login(req.body.loginOrEmail, req.body.password)

  if (!token) {
    res.sendStatus(401)
    return
  }

  res.status(200).send(token)
})

authRoute.get('/me', authJwtMiddleware, async (req: Request, res: Response<AuthMeOutputModel>) => {
  // const user = await UserRepository.getUserById(req.user!._id)
  const user = await UserQueryRepository.getUserById(req.user!._id.toString())

  if (!user) {
    res.sendStatus(401)
    return
  }

  // return res.status(200).send({email: user.email, login: user.login, userId: user._id.toString()})
  return res.status(200).send(user)
})

authRoute.post('/registration', credsValidation(), async (req: RequestWithBody<RegistrationInputModel>, res: Response) => {
  const user = AuthService.register(req.body)

  if (!user) {
    res.sendStatus(400)
    return
  }

  res.sendStatus(204)
})

authRoute.post('/registration-confirmation', async (req: RequestWithBody<ConfirmEmailInputModel>, res: Response) => {
  const isConfirmed = await AuthService.confirmEmail(req.body.code)

  if (!isConfirmed) {
    res.status(400).send(generateErrorMessageResponse("the confirmation code is incorrect, expired or already been applied", "code"))
    return
  }

  res.sendStatus(204)
})

authRoute.post('/registration-email-resending', emailValidation(), async (req: RequestWithBody<ResendEmailInputModel>, res: Response) => {
  const resentedEmail = await AuthService.resendEmail(req.body.email)

  if (resentedEmail === null) {
    res.status(400).send(generateErrorMessageResponse("email is already confirmed", "email"))
    return
  }

  res.sendStatus(204)
})


/**
 * Generates an object with an error message for a specific field.
 * @param {string} message - The error message.
 * @param {string} field - The name of the field for which the error message is generated.
 * @returns {Object} - An object with an error message for a specific field.
 * @property {Array<Object>} errorsMessages - An array of objects containing error messages.
 * @property {string} errorsMessages[].message - The error message.
 * @property {string} errorsMessages[].field - The name of the field for which the error message is generated.
 */
const generateErrorMessageResponse = (message: string, field: string): object => {
  return {
    errorsMessages: [
      {
        message: message,
        field: field
      }
    ]
  }
}