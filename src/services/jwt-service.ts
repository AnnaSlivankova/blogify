import jwt from 'jsonwebtoken'
import {SETTINGS} from "../app";
import {UserDb} from "../models/user-models/db/user-db";
import {ObjectId, WithId} from "mongodb";

export class JwtService {
  static async createJWT(user: WithId<UserDb>): Promise<string> {
    return jwt.sign({userId: user._id}, SETTINGS.JWT_SECRET!, {expiresIn: '1h'})
  }

  static async getUserIdByToken(token: string): Promise<null | ObjectId> {
    try {
      const result: any = jwt.verify(token, SETTINGS.JWT_SECRET!)

      return new ObjectId(result.userId)
    } catch (e) {
      return null
    }
  }
}