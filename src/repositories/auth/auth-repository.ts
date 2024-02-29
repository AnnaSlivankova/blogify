import {UserDb} from "../../models/user-models/db/user-db";
import {ObjectId, WithId} from "mongodb";
import {UserModel} from "../user/user-schema";

export class AuthRepository {
  static async getSearchedUser(loginOrEmail: string) {
    try {
      let query = UserModel.findOne()
      query.or([{login: loginOrEmail}, {email: loginOrEmail}])

      return query.lean()
    } catch (e) {
      return null
    }
  }

  static async getUserById(id: string) {
    try {
      return UserModel.findOne({_id: new ObjectId(id)}).lean()
    } catch (e) {
      return null
    }
  }

  static async createUser(createdData: UserDb): Promise<WithId<UserDb> | null> {
    try {
      const user = new UserModel(createdData)

      return user.save()
    } catch (e) {
      return null
    }
  }

  static async updateConfirmationStatus(_id: ObjectId): Promise<boolean> {
    try {
      const user = await UserModel.findOne({_id})
      if (!user) return false

      user.emailConfirmation!.isConfirmed = true

      await user.save()

      return true
    } catch (e) {
      console.log('updateConfirmationStatus is failed')
      return false
    }
  }

  static async updateConfirmationCode(_id: ObjectId, newCode: string): Promise<boolean> {
    try {
      const user = await UserModel.findOne({_id})
      if (!user) return false

      user.emailConfirmation!.confirmationCode = newCode

      await user.save()

      return true
    } catch (e) {
      console.log('updateConfirmationCode is failed')
      return false
    }
  }

  static async updateRecoveryPassInfo(_id: ObjectId, recoveryCode: string, expirationDate: Date): Promise<boolean> {
    try {
      const user = await UserModel.findOne({_id})
      if (!user) return false

      user.passwordRecovery!.recoveryCode = recoveryCode
      user.passwordRecovery!.expirationDate = expirationDate

      await user.save()

      return true
    } catch (e) {
      return false
    }
  }

  static async updateUserHash(_id: ObjectId, newHash: string, updatedAt: string): Promise<boolean> {
    try {
      const user = await UserModel.findOne({_id})
      if (!user) return false

      user.hash = newHash
      user.passwordRecovery!.updatedAt = updatedAt
      user.passwordRecovery!.recoveryCode = undefined
      user.passwordRecovery!.expirationDate = undefined

      await user.save()

      return true
    } catch (e) {
      return false
    }
  }
}