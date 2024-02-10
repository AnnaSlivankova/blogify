import {Response, Request, Router} from "express";
import {RequestWithBody} from "../types";
import {LoginInputModel} from "../models/auth-models/login-input-model";
import {AuthService} from "../services/auth-service";
import {authJwtMiddleware} from "../middlewares/auth/auth-jwt-middleware";
import {UserRepository} from "../repositories/user-repository";

export const authRoute = Router({})

authRoute.post('/login', async (req: RequestWithBody<LoginInputModel>, res: Response) => {
  const token = await AuthService.login(req.body.loginOrEmail, req.body.password)

  if (!token) {
    res.sendStatus(401)
    return
  }

  res.status(200).send(token)
})

authRoute.get('/me', authJwtMiddleware, async (req: Request, res: Response) => {
  const user = await UserRepository.getUserById(req.user!._id)

  if (!user) {
    res.sendStatus(401)
    return
  }

  return res.status(200).send({email: user.email, login: user.login, userId: user._id.toString()})
})