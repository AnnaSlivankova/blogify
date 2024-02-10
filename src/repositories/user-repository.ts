import {UserDb} from "../models/user-models/db/user-db";
import {usersCollection} from "../db/db";
import {UserViewModel} from "../models/user-models/output/user-view-model";
import {userMapper} from "../models/user-models/mapper/user-mapper";
import {ObjectId, WithId} from "mongodb";

export class UserRepository {
  static async createUser(createdData: UserDb): Promise<UserViewModel | null> {
    try {
      const res = await usersCollection.insertOne(createdData)

      const user = await usersCollection.findOne({_id: new ObjectId(res.insertedId.toString())})

      if (!user) {
        return null
      }

      return userMapper(user)
    } catch (e) {
      return null
    }
  }

  static async deleteUser(userId: string): Promise<boolean> {
    try {
      const res = await usersCollection.deleteOne({_id: new ObjectId(userId)})

      return !!res.deletedCount
    } catch (e) {
      return false
    }
  }

  static async getUserById(userId: ObjectId): Promise<null | WithId<UserDb>> {
    try {
      const user = await usersCollection.findOne({_id: userId})

      if (!user) {
        return null
      }

      return user
    } catch (e) {
      return null
    }
  }
}