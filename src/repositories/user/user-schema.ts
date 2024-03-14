import mongoose from "mongoose";
import {UserDb} from "../../models/user-models/db/user-db";

export const UserSchema = new mongoose.Schema<UserDb>({
  login: {type: String, require: true},
  email: {type: String, require: true},
  createdAt: {type: String, require: true},
  hash: {type: String, require: true},
  emailConfirmation: {
    confirmationCode: String,
    expirationDate: Date,
    isConfirmed: Boolean,
  },
  passwordRecovery: {
    recoveryCode: String,
    expirationDate: Date,
    updatedAt: String,
  },
})

export const UserModel = mongoose.model<UserDb>('users', UserSchema)