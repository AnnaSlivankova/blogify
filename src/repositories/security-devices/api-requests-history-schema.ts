import mongoose from "mongoose";
import {ApiRequestsHistoryDb} from "../../models/device-auth-sessions-models/db/api-requests-history-db";

export const ApiRequestsHistorySchema = new mongoose.Schema<ApiRequestsHistoryDb>({
  ip: {type: String, require: true},
  url: {type: String, require: true},
  date: {type: Date, require: true},
})

export const ApiRequestsHistoryModel = mongoose.model<ApiRequestsHistoryDb>('apiRequestsHistory', ApiRequestsHistorySchema)