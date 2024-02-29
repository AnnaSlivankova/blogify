import {DeviceAuthSessionsDb} from "../../models/device-auth-sessions-models/db/device-auth-sessions-db";
import {ApiRequestsHistoryDb} from "../../models/device-auth-sessions-models/db/api-requests-history-db";
import {DeviceAuthSessionsModel} from "./device-auth-sessions-schema";
import {ApiRequestsHistoryModel} from "./api-requests-history-schema";

export class SecurityDevicesRepository {
  static async saveDeviceSession(sessionData: DeviceAuthSessionsDb): Promise<null | string> {
    try {
      const deviceSession = new DeviceAuthSessionsModel(sessionData)
      const res = await deviceSession.save()

      return res._id.toString()
    } catch (e) {
      return null
    }
  }

  static async updateDeviceSession(expDate: string, lastActiveDate: string, userId: string, deviceId: string): Promise<boolean> {
    try {
      const deviceSession = await DeviceAuthSessionsModel.findOne({userId, deviceId})
      if (!deviceSession) return false

      deviceSession.issuedAt = expDate
      deviceSession.lastActiveDate = lastActiveDate

      await deviceSession.save()

      return true
    } catch (e) {
      return false
    }
  }

  static async deleteRemoteSessions(deviceId: string, userId: string): Promise<boolean> {
    try {
      const res = await DeviceAuthSessionsModel.deleteMany({userId, deviceId: {$ne: deviceId}})

      return !!res.deletedCount
    } catch (e) {
      return false
    }
  }

  static async deleteSessionByDeviceId(deviceId: string): Promise<boolean> {
    try {
      const res = await DeviceAuthSessionsModel.deleteOne({deviceId})

      return !!res.deletedCount
    } catch (e) {
      return false
    }
  }

  static async getSessionByDeviceId(deviceId: string): Promise<null | DeviceAuthSessionsDb> {
    try {
      return DeviceAuthSessionsModel.findOne({deviceId}).lean()
    } catch (e) {
      return null
    }
  }

  static async saveRequestHistory(data: ApiRequestsHistoryDb): Promise<boolean> {
    try {
      const requestHistory = new ApiRequestsHistoryModel(data)
      await requestHistory.save()

      return true
    } catch (e) {
      return false
    }
  }

  static async getCountRequestsHistory(ip: string, url: string, tenSecondsAgo: Date): Promise<number | null> {
    try {
      const query = ApiRequestsHistoryModel.find({ip, url, date: {$gte: tenSecondsAgo}})

      return await query.countDocuments()
    } catch (e) {
      return null
    }
  }
}