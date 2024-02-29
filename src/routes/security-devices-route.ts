import {Router, Request, Response} from "express";
import {authRefreshJwtMiddleware} from "../middlewares/auth/auth-refresh-jwt-middleware";
import {SecurityDevicesQueryRepository} from "../repositories/security-devices/security-devices-query-repository";
import {SecurityDevicesService} from "../services/security-devices-service";

export const securityDevicesRoute = Router()

securityDevicesRoute.get('/', authRefreshJwtMiddleware, async (req: Request, res: Response) => {
  const sessions = await SecurityDevicesQueryRepository.getAllActiveSessions(req.user!._id.toString())

  if (!sessions) {
    res.sendStatus(401)
    return
  }

  res.status(200).send(sessions)
})

securityDevicesRoute.delete('/', authRefreshJwtMiddleware, async (req: Request, res: Response) => {
  const userId = req.user!._id.toString()
  const deviceId = req.user!.deviceId as string

  const isSessionsTerminated = await SecurityDevicesService.terminateRemoteSessions(deviceId, userId)

  if (!isSessionsTerminated) {
    res.sendStatus(404)
    return
  }

  res.sendStatus(204)
})

securityDevicesRoute.delete('/:id', authRefreshJwtMiddleware, async (req: Request<
  { id: string }>, res: Response) => {
  const deviceId = req.params.id
  const userId = req.user!._id.toString()

  const isValidDeviceId = await SecurityDevicesService.checkValidDeviceId(deviceId)
  if(!isValidDeviceId) {
    res.sendStatus(404)
    return
  }

  const isRightUser = await SecurityDevicesService.checkValidUser(deviceId, userId)
  if (!isRightUser) {
    res.sendStatus(403)
    return
  }

  const isSessionTerminated = await SecurityDevicesService.terminateSessionById(deviceId)

  if (!isSessionTerminated) {
    res.sendStatus(500)
    return
  }

  res.sendStatus(204)
})