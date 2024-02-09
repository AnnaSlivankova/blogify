import {WithId} from "mongodb";
import {UserDb} from "../db/user-db";
import {UserViewModel} from "../output/user-view-model";

export const userMapper = (user: WithId<UserDb>): UserViewModel => {
  return {
    id: user._id.toString(),
    createdAt: user.createdAt,
    login: user.login,
    email: user.email
  }
}