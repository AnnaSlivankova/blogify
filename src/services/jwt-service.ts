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

  static async validateToken(token: string): Promise<boolean | string> {
    try {
      const decodedToken: any = jwt.verify(token, SETTINGS.JWT_SECRET!)

      const expDate = new Date(decodedToken.exp * 1000)
      const isExpired = expDate < new Date()
      if(isExpired) return false

      return decodedToken.userId
    } catch (e) {
      console.log('validateToken', false)
      return false
    }
  }
}