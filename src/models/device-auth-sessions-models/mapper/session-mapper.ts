import {WithId} from "mongodb";
import {DeviceAuthSessionsDb} from "../db/device-auth-sessions-db";
import {SessionOutputViewModel} from "../output/session-output-view-model";

export const sessionMapper = (session: WithId<DeviceAuthSessionsDb>): SessionOutputViewModel => {
  return {
    ip: session.ip,
    title: session.deviceName,
    lastActiveDate: session.lastActiveDate,
    deviceId: session.deviceId
  }
}