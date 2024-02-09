import {Response, Router} from "express";
import {RequestWithBody} from "../types";
import {LoginInputModel} from "../models/auth-models/login-input-model";
import {AuthService} from "../services/auth-service";

export const authRoute = Router({})

authRoute.post('/', async (req: RequestWithBody<LoginInputModel>, res: Response) => {
  const isAuth = await AuthService.login(req.body.loginOrEmail, req.body.password)

  if (!isAuth) {
    res.sendStatus(401)
    return
  }

  res.sendStatus(204)
})