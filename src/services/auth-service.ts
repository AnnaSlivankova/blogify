import {AuthRepository} from "../repositories/auth-repository";
import {BcryptService} from "./bcrypt-service";
import {JwtService} from "./jwt-service";
import {LoginOutputModel} from "../models/auth-models/login-output-model";

export class AuthService {
  static async login(loginOrEmail: string, password: string): Promise<null | LoginOutputModel> {
    const user = await AuthRepository.getSearchedUser(loginOrEmail)

    if (!user) {
      return null
    }

    const isPassValid = await BcryptService.compareHashes(password, user.hash)

    if (!isPassValid) {
      return null
    }

    const accessToken = await JwtService.createJWT(user)

    return {accessToken}
  }
}