import {deviceAuthSessionsCollection} from "../db/db";
import {SessionOutputViewModel} from "../models/device-auth-sessions-models/output/session-output-view-model";
import {sessionMapper} from "../models/device-auth-sessions-models/mapper/session-mapper";

export class SecurityDevicesQueryRepository {
  static async getAllActiveSessions(userId: string): Promise<null | SessionOutputViewModel[]> {
    try {
      const userSessions = await deviceAuthSessionsCollection
        .find({userId: userId})
        .toArray()

      if (!userSessions.length) return null

      return userSessions.map(sessionMapper)
    } catch (e) {
      return null
    }
  }
}