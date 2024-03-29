import {Request, Response, Router} from "express";
import {RequestWithBody} from "../types";
import {LoginInputModel} from "../models/auth-models/input/login-input-model";
import {AuthService} from "../services/auth-service/auth-service";
import {authJwtMiddleware} from "../middlewares/auth/auth-jwt-middleware";
import {emailValidation, passwordValidation} from "../validators/user-validators";
import {RegistrationInputModel} from "../models/auth-models/input/registration-input-model";
import {ResendEmailInputModel} from "../models/auth-models/input/resend-email-input-model";
import {credsValidation} from "../validators/auth-validators";
import {ConfirmEmailInputModel} from "../models/auth-models/input/confirmation-email-input-model";
import {AuthMeOutputModel} from "../models/auth-models/output/auth-me-output-model";
import {UserQueryRepository} from "../repositories/user/user-query-repository";
import {authRefreshJwtMiddleware} from "../middlewares/auth/auth-refresh-jwt-middleware";
import {customRateLimitMiddleware} from "../middlewares/auth/custom-rate-limit-middleware";
import {PasswordRecoveryInputModel} from "../models/auth-models/input/password-recovery-input-model";
import {ConfirmationRecoveryPassInputModel} from "../models/auth-models/input/confirmation-recovery-pass-input-model";

export const authRoute = Router({})

authRoute.post('/login', customRateLimitMiddleware, async (req: RequestWithBody<LoginInputModel>, res: Response) => {
  const tokens = await AuthService.login(req.body.loginOrEmail, req.body.password, req.ip!, req.headers["user-agent"]!)

  if (!tokens) {
    res.sendStatus(401)
    return
  }

  const {accessToken, refreshToken} = tokens

  return res
    .cookie('refreshToken', refreshToken, {httpOnly: true, secure: true})
    .status(200)
    .send({accessToken})
})

authRoute.post('/refresh-token', authRefreshJwtMiddleware, async (req: Request, res: Response) => {
  const deviceId = req.user!.deviceId as string
  const userId = req.user!._id

  const tokens = await AuthService.refreshTokens(req.cookies['refreshToken'], userId, deviceId)

  if (!tokens) {
    res.sendStatus(500)
    return
  }

  const {accessToken, refreshToken} = tokens

  return res
    .cookie('refreshToken', refreshToken, {httpOnly: true, secure: true})
    .status(200)
    .send({accessToken})
})

authRoute.post('/logout', authRefreshJwtMiddleware, async (req: Request, res: Response) => {
  const deviceId = req.user!.deviceId as string
  const isLogout = await AuthService.logout(deviceId)

  if (!isLogout) return res.sendStatus(401)

  return res.sendStatus(204)
})

authRoute.get('/me', authJwtMiddleware, async (req: Request, res: Response<AuthMeOutputModel>) => {
  const user = await UserQueryRepository.getUserById(req.user!._id.toString())

  if (!user) {
    res.sendStatus(401)
    return
  }

  return res.status(200).send(user)
})

authRoute.post('/registration', credsValidation(), customRateLimitMiddleware, async (req: RequestWithBody<RegistrationInputModel>, res: Response) => {
  const user = await AuthService.register(req.body)

  if (!user) {
    res.sendStatus(400)
    return
  }

  res.sendStatus(204)
})

authRoute.post('/registration-confirmation', customRateLimitMiddleware, async (req: RequestWithBody<ConfirmEmailInputModel>, res: Response) => {
  const isConfirmed = await AuthService.confirmEmail(req.body.code)

  if (!isConfirmed) {
    res.status(400).send(generateErrorMessageResponse("the confirmation code is incorrect, expired or already been applied", "code"))
    return
  }

  res.sendStatus(204)
})

authRoute.post('/registration-email-resending', emailValidation(), customRateLimitMiddleware, async (req: RequestWithBody<ResendEmailInputModel>, res: Response) => {
  const resentedEmail = await AuthService.resendEmail(req.body.email)

  if (resentedEmail === null) {
    res.status(400).send(generateErrorMessageResponse("email is already confirmed", "email"))
    return
  }

  res.sendStatus(204)
})

authRoute.post('/password-recovery', emailValidation(), customRateLimitMiddleware, async (req: RequestWithBody<PasswordRecoveryInputModel>, res: Response) => {
  const isInstructionsSent = await AuthService.sendPassRecoverInstructions(req.body.email)

  if (!isInstructionsSent) {
    res.sendStatus(500)
    return
  }

  res.sendStatus(204)
})

authRoute.post('/new-password', passwordValidation(), customRateLimitMiddleware, async (req: RequestWithBody<ConfirmationRecoveryPassInputModel>, res: Response) => {
  const isPassChanged = await AuthService.changePassword(req.body.newPassword, req.body.recoveryCode)

  if (!isPassChanged) {
    res.status(400).send(generateErrorMessageResponse("the confirmation code is incorrect, expired or already been applied", "recoveryCode"))
    return
  }

  res.sendStatus(204)
})

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