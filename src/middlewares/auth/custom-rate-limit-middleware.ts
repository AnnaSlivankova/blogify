import {NextFunction, Request, Response} from "express";
import {SecurityDevicesService} from "../../services/security-devices-service";

export const customRateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip ?? 'Unknown ip'
  const url = req.originalUrl
  const date = new Date()

  const result = await SecurityDevicesService.limitRequestsRate({ip, url, date})

  if (!result) {
    res.sendStatus(429)
    return
  }

  return next()
}