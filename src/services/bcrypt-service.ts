import bcrypt from "bcrypt";

export class BcryptService {
  static async generateHash(pass: string): Promise<string> {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(pass, salt)
  }

  static async compareHashes(pass: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(pass, hash)
  }
}