import {UserDb} from "../../models/user-models/db/user-db";
import {UserViewModel} from "../../models/user-models/output/user-view-model";
import {userMapper} from "../../models/user-models/mapper/user-mapper";
import {ObjectId, WithId} from "mongodb";
import {UserModel} from "./user-schema";

export class UserRepository {
  static async createUser(createdData: UserDb): Promise<UserViewModel | null> {
    try {
      const user = new UserModel(createdData)
      const res = await user.save()

      return userMapper(res)
    } catch (e) {
      return null
    }
  }

  static async deleteUser(userId: string): Promise<boolean> {
    try {
      const user = await UserModel.findOne({_id: new ObjectId(userId)}).lean()
      if (!user) return false

      const res = await UserModel.deleteOne({_id: new ObjectId(userId)})

      return !!res.deletedCount
    } catch (e) {
      return false
    }
  }

  static async getUserById(userId: ObjectId): Promise<null | WithId<UserDb>> {
    try {
      return UserModel.findOne({_id: new ObjectId(userId)}).lean()
    } catch (e) {
      return null
    }
  }
}