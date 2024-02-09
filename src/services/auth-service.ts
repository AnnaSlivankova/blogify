import {AuthRepository} from "../repositories/auth-repository";
import {BcryptService} from "./bcrypt-service";

export class AuthService {
  static async login(loginOrEmail: string, password: string): Promise<null | boolean> {
    const user = await AuthRepository.getSearchedUser(loginOrEmail)

    if (!user) {
      return null
    }

    const isPassValid = await BcryptService.compareHashes(password, user.hash)

    if (!isPassValid) {
      return null
    }

    return isPassValid
  }
}