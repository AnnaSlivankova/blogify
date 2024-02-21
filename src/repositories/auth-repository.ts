import {usersCollection} from "../db/db";
import {UserDb} from "../models/user-models/db/user-db";
import {ObjectId, WithId} from "mongodb";

export class AuthRepository {
  static async getSearchedUser(loginOrEmail: String) {
    try {
      const user = await usersCollection
        .findOne({
          $or: [
            {login: loginOrEmail},
            {email: loginOrEmail}
          ]
        })

      if (!user) {
        return null
      }

      return user

    } catch (e) {
      return null
    }
  }

  static async getUserById(id: string) {
    try {
      const user = await usersCollection.findOne({_id: new ObjectId(id)})

      if (!user) {
        return null
      }

      return user

    } catch (e) {
      return null
    }
  }

  static async createUser(createdData: UserDb): Promise<WithId<UserDb> | null> {
    try {
      const res = await usersCollection.insertOne(createdData)

      const user = await usersCollection.findOne({_id: new ObjectId(res.insertedId.toString())})

      if (!user) {
        return null
      }

      return user
    } catch (e) {
      return null
    }
  }

  static async updateConfirmationStatus(_id: ObjectId): Promise<boolean> {
    try {
      const res = await usersCollection.updateOne({_id}, {$set: {'emailConfirmation.isConfirmed': true}})

      return !!res.matchedCount
    } catch (e) {
      return false
    }
  }

  static async updateConfirmationCode(_id: ObjectId, newCode: string): Promise<boolean> {
    try {
      const res = await usersCollection.updateOne({_id}, {$set: {'emailConfirmation.confirmationCode': newCode}})

      return !!res.matchedCount
    } catch (e) {
      return false
    }
  }
}