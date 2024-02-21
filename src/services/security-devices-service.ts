import {SecurityDevicesRepository} from "../repositories/security-devices-repository";
import {ApiRequestsHistoryDb} from "../models/device-auth-sessions-models/db/api-requests-history-db";
import {add} from "date-fns";

export class SecurityDevicesService {
  static async terminateRemoteSessions(deviceId: string, userId: string): Promise<boolean> {
    return await SecurityDevicesRepository.deleteRemoteSessions(deviceId, userId)
  }

  static async terminateSessionById(deviceId: string): Promise<boolean> {
    const session = await SecurityDevicesRepository.getSessionByDeviceId(deviceId)
    if (!session) return false

    const isDeleted = await SecurityDevicesRepository.deleteSessionByDeviceId(deviceId)
    if (!isDeleted) return false

    return true
  }

  static async checkValidDeviceId(deviceId: string): Promise<boolean> {
    const session = await SecurityDevicesRepository.getSessionByDeviceId(deviceId)
    return !!session
  }

  static async checkValidUser(deviceId: string, userId: string): Promise<boolean> {
    const userSession = await SecurityDevicesRepository.getSessionByDeviceId(deviceId)
    if (!userSession) return false

    if (userSession.userId !== userId) return false

    return true
  }

  static async limitRequestsRate(reqData: ApiRequestsHistoryDb) {
    const tenSecondsAgo = add(new Date(), {seconds: -10})

    const [isSaved, count] = await Promise.all([
      SecurityDevicesRepository.saveRequestHistory(reqData),
      SecurityDevicesRepository.getCountRequestsHistory(reqData.ip, reqData.url, tenSecondsAgo)
    ])

    // if (count as number >= 5 || !isSaved) return null
    if (count as number >= 5) return null

    return true
  }
}