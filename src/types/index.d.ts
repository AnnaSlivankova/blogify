import {WithId} from "mongodb";
import {UserDb} from "../models/user-models/db/user-db";

declare global {
  declare namespace Express {
    export interface Request {
      user: WithId<UserDb> & Partial<MetaInfo> | null
    }
  }
}

type MetaInfo = {
  deviceId: string
}