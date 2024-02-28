import {NextFunction, Request, Response} from "express";
import {SecurityDevicesService} from "../../services/security-devices-service";
import {add} from "date-fns";
import {SecurityDevicesRepository} from "../../repositories/security-devices-repository";
import {apiRequestsHistoryCollection} from "../../db/db";

export const customRateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip ?? 'Unknown ip'
  const url = req.originalUrl
  const date = new Date()
  const tenSecondsAgo = add(new Date(), {seconds: -10})

  // await SecurityDevicesRepository.saveRequestHistory({ip, url, date})
  // const count = await apiRequestsHistoryCollection.countDocuments({
  //   ip,
  //   url,
  //   date: {$gte: tenSecondsAgo}
  // })
  //
  // if (count > SETTINGS_REWRITE.REQ_ATTEMPT) {
  //   res.sendStatus(429)
  //   return
  // }

  const result = await SecurityDevicesService.limitRequestsRate({ip, url, date})

  if(!result) {
    res.sendStatus(429)
    return
  }

  return next()
}