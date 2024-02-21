import {apiRequestsHistoryCollection, deviceAuthSessionsCollection} from "../db/db";
import {DeviceAuthSessionsDb} from "../models/device-auth-sessions-models/db/device-auth-sessions-db";
import {ApiRequestsHistoryDb} from "../models/device-auth-sessions-models/db/api-requests-history-db";

export class SecurityDevicesRepository {
  static async saveDeviceSession(sessionData: DeviceAuthSessionsDb): Promise<null | string> {
    try {
      const res = await deviceAuthSessionsCollection.insertOne(sessionData)

      return res.insertedId.toString()
    } catch (e) {
      return null
    }
  }

  static async updateDeviceSession(expDate: string, lastActiveDate: string, userId: string, deviceId: string): Promise<boolean> {
    try {
      const res = await deviceAuthSessionsCollection
        .updateOne({
          $and: [
            {"userId": userId},
            {"deviceId": deviceId}
          ]
        }, {
          $set: {
            issuedAt: expDate,
            lastActiveDate: lastActiveDate
          }
        })

      return !!res.modifiedCount
    } catch (e) {
      return false
    }
  }

  static async deleteRemoteSessions(deviceId: string, userId: string): Promise<boolean> {
    try {
      const res = await deviceAuthSessionsCollection.deleteMany({
        $and: [
          {"userId": userId},
          {"deviceId": {$ne: deviceId}}
        ]
      })

      return !!res.deletedCount
    } catch (e) {
      return false
    }
  }

  static async deleteSessionByDeviceId(deviceId: string): Promise<boolean> {
    try {
      const res = await deviceAuthSessionsCollection.deleteOne({deviceId: deviceId})
      return !!res.deletedCount
    } catch (e) {
      return false
    }
  }

  static async getSessionByDeviceId(deviceId: string): Promise<null | DeviceAuthSessionsDb> {
    try {
      const userSession = await deviceAuthSessionsCollection
        .findOne({deviceId: deviceId})
      if (!userSession) return null

      return userSession
    } catch (e) {
      return null
    }
  }

  static async saveRequestHistory(data: ApiRequestsHistoryDb): Promise<boolean> {
    try {
      const res = await apiRequestsHistoryCollection.insertOne(data)
      return !!res.insertedId
    } catch (e) {
      return false
    }
  }

  static async getCountRequestsHistory(ip: string, url: string, tenSecondsAgo: Date): Promise<number | null > {
    try {
      return  await apiRequestsHistoryCollection.countDocuments({
        ip,
        url,
        date: {$gte: tenSecondsAgo}
      })
    } catch (e) {
      return null
    }
  }
}