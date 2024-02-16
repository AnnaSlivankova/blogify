import {NextFunction, Request, Response} from "express";
import {JwtService} from "../../services/jwt-service";
import {ObjectId} from "mongodb";
import {UserService} from "../../services/user-service";

export const authRefreshJwtMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies['refreshToken'];

  if (!refreshToken) {
    res.sendStatus(401)
    return
  }

  const isValid = await JwtService.validateToken(refreshToken)

  if (!isValid) {
    res.sendStatus(401)
    return
  }

  req.user = await UserService.getUserById(new ObjectId(isValid as string))
  next()
}