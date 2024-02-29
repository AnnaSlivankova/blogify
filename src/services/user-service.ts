import {CreateUserModel} from "../models/user-models/input/create-user-model";
import {UserViewModel} from "../models/user-models/output/user-view-model";
import {UserDb} from "../models/user-models/db/user-db";
import {UserRepository} from "../repositories/user/user-repository";
import {BcryptService} from "./bcrypt-service";
import {ObjectId, WithId} from "mongodb";

export class UserService {
  static async createUser(createUserModel: CreateUserModel): Promise<UserViewModel | null> {
    const {email, login, password} = createUserModel

    const hash = await BcryptService.generateHash(password)

    const newUser: UserDb = {
      email,
      login,
      createdAt: new Date().toISOString(),
      hash
    }

    const createdUser = await UserRepository.createUser(newUser)

    if (!createdUser) {
      return null
    }

    return createdUser
  }

  static async deleteUser(userId: string): Promise<boolean> {
    const isUserDeleted = await UserRepository.deleteUser(userId)

    if (!isUserDeleted) {
      return false
    }

    return isUserDeleted
  }

  static async getUserById(userId: ObjectId): Promise<WithId<UserDb> | null> {
    const user = await UserRepository.getUserById(userId)

    if (!user) {
      return null
    }

    return user
  }
}