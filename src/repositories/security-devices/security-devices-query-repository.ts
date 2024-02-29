import {SessionOutputViewModel} from "../../models/device-auth-sessions-models/output/session-output-view-model";
import {sessionMapper} from "../../models/device-auth-sessions-models/mapper/session-mapper";
import {DeviceAuthSessionsModel} from "./device-auth-sessions-schema";

export class SecurityDevicesQueryRepository {
  static async getAllActiveSessions(userId: string): Promise<null | SessionOutputViewModel[]> {
    try {
      const userSessions = await DeviceAuthSessionsModel
        .find({userId: userId})
        .lean()

      if (!userSessions.length) return null

      return userSessions.map(sessionMapper)
    } catch (e) {
      return null
    }
  }
}