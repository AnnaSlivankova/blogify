import {UserViewModel} from "../models/user-models/output/user-view-model";
import {Pagination} from "../types";
import {usersCollection} from "../db/db";
import {SortDirection, WithId} from "mongodb";
import {UserDb} from "../models/user-models/db/user-db";

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
        items: users.map(this.userMapper)
      }

    } catch (e) {
      return null
    }
  }


  static userMapper(user: WithId<UserDb>): UserViewModel {
    return {
      id: user._id.toString(),
      email: user.email,
      login: user.login,
      createdAt: user.createdAt
    }
  }
}

type SortData = {
  sortBy: string
  sortDirection: SortDirection
  pageNumber: number
  pageSize: number
  searchLoginTerm: string | null
  searchEmailTerm: string | null
}