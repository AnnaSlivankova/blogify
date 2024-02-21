import {NextFunction, Request, Response} from "express";
import {JwtService, PayloadWithConvertedDates} from "../../services/jwt-service";
import {ObjectId} from "mongodb";
import {UserService} from "../../services/user-service";
import {SecurityDevicesRepository} from "../../repositories/security-devices-repository";

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

  const {deviceId, userId, iat, exp} = isValid as PayloadWithConvertedDates

  const isSessionExists = await SecurityDevicesRepository.getSessionByDeviceId(deviceId)

  if (!isSessionExists) {
    res.sendStatus(401)
    return
  }

  if(exp !== isSessionExists.issuedAt || userId !== isSessionExists.userId) {
    res.sendStatus(401)
    return
  }

  const userData = await UserService.getUserById(new ObjectId(userId as string))

  if (!userData) {
    res.sendStatus(401)
    return
  }


  req.user = {...userData, deviceId}
  // req.user = await UserService.getUserById(new ObjectId(isValid as string))
  next()
}