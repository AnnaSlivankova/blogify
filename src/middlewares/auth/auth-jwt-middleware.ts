import {Request, Response, NextFunction} from "express";
import {JwtService} from "../../services/jwt-service";
import {UserService} from "../../services/user-service";

export const authJwtMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    res.sendStatus(401)
    return
  }

  const token = req.headers.authorization.split(' ')[1]

  console.log('token from header', token)

  const userId = await JwtService.getUserIdByToken(token)

  if (!userId) {
    res.sendStatus(401)
    return
  }

  req.user = await UserService.getUserById(userId)
  next()
}