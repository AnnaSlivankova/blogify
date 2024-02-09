import {usersCollection} from "../db/db";

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
}