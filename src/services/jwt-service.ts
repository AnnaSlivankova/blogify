import jwt from 'jsonwebtoken'
import {SETTINGS} from "../app";
import {UserDb} from "../models/user-models/db/user-db";
import {ObjectId, WithId} from "mongodb";

export class JwtService {
  static async createJWT(user: WithId<UserDb>, exp: string): Promise<string> {
    return jwt.sign({userId: user._id.toString()}, SETTINGS.JWT_SECRET!, {expiresIn: exp})
  }

  static async getUserIdByToken(token: string): Promise<null | ObjectId> {
    try {
      const result: any = jwt.verify(token, SETTINGS.JWT_SECRET!)

      return new ObjectId(result.userId)
    } catch (e) {
      return null
    }
  }

  static async validateToken(token: string): Promise<boolean | PayloadWithConvertedDates> {
    try {
      const decodedToken: any = jwt.verify(token, SETTINGS.JWT_SECRET!)

      const deviceId = decodedToken.deviceId
      const userId = decodedToken.userId
      const iat = new Date(decodedToken.iat * 1000).toISOString()
      const exp = new Date(decodedToken.exp * 1000).toISOString()

      return {deviceId, userId, iat, exp}
    } catch (e) {
      console.log('validateToken', false)
      return false
    }
  }

  static async getExpirationDate(token: string): Promise<string | null> {
    try {
      const decodedToken: any = jwt.decode(token)

      return new Date(decodedToken.exp * 1000).toISOString()
    } catch (e) {
      console.log('getExpirationDate failed')
      return null
    }
  }

  static async createJWTRefreshToken(payload: RefreshPayload, exp: string): Promise<string> {
    return jwt.sign(payload, SETTINGS.JWT_SECRET!, {expiresIn: exp})
  }
}

type RefreshPayload = {
  deviceId: string
  userId: string
  sessionId?: string;
}

export type PayloadWithConvertedDates = {
  deviceId: string
  userId: string
  iat: string
  exp: string
}