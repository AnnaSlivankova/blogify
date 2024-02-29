import mongoose from "mongoose";
import {DeviceAuthSessionsDb} from "../../models/device-auth-sessions-models/db/device-auth-sessions-db";

export const DeviceAuthSessionsSchema = new mongoose.Schema<DeviceAuthSessionsDb>({
  issuedAt: {type: String, require: true},
  deviceId: {type: String, require: true},
  ip: {type: String, require: true},
  deviceName: {type: String, require: true},
  userId: {type: String, require: true},
  lastActiveDate: {type: String, require: true},
})

export const DeviceAuthSessionsModel = mongoose.model<DeviceAuthSessionsDb>('deviceAuthSessions', DeviceAuthSessionsSchema)