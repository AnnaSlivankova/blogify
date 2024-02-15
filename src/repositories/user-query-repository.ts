import {UserViewModel} from "../models/user-models/output/user-view-model";
import {Pagination} from "../types";
import {usersCollection} from "../db/db";
import {ObjectId, SortDirection} from "mongodb";
import {userMapper} from "../models/user-models/mapper/user-mapper";
import {AuthMeOutputModel} from "../models/auth-models/output/auth-me-output-model";

export class UserQueryRepository {
  static async getAllUsers(sortData: SortData): Promise<Pagination<UserViewModel> | null> {
    let filter = {}
    const {sortBy, sortDirection, pageNumber, pageSize, searchLoginTerm, searchEmailTerm} = sortData

    if (searchLoginTerm !== null || searchEmailTerm !== null) {
      filter = {
        $or: [
          {login: {$regex: new RegExp(searchLoginTerm as string, 'i')}},
          {
            email: {$regex: new RegExp(searchEmailTerm as string, 'i')}
          }]
      }
    }

    try {
      const users = await usersCollection
        .find(filter)
        .sort(sortBy, sortDirection)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .toArray()

      const totalCount = await usersCollection.countDocuments(filter)

      const pagesCount = Math.ceil(totalCount / pageSize)

      return {
        pagesCount,
        page: pageNumber,
        pageSize,
        totalCount,
        items: users.map(userMapper)
      }

    } catch (e) {
      return null
    }
  }

  static async getUserById(userId: string): Promise<null | AuthMeOutputModel> {
    try {
      const user = await usersCollection.findOne({_id: new ObjectId(userId)})

      if (!user) return null

      return {email: user.email, login: user.login, userId: user._id.toString()}
    } catch (e) {
      return null
    }
  }

  // private _userMapper(user: WithId<UserDb>): AuthMeOutputModel {
  //   return {
  //     id: user._id.toString(),
  //     email: user.email,
  //     login: user.login,
  //   }
  // }
}

type SortData = {
  sortBy: string
  sortDirection: SortDirection
  pageNumber: number
  pageSize: number
  searchLoginTerm: string | null
  searchEmailTerm: string | null
}