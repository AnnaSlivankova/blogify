import {UserViewModel} from "../../models/user-models/output/user-view-model";
import {Pagination} from "../../types";
import {ObjectId, SortDirection} from "mongodb";
import {userMapper} from "../../models/user-models/mapper/user-mapper";
import {AuthMeOutputModel} from "../../models/auth-models/output/auth-me-output-model";
import {UserModel} from "./user-schema";

export class UserQueryRepository {
  static async getAllUsers(sortData: SortData): Promise<Pagination<UserViewModel> | null> {
    try {
      const {sortBy, sortDirection, pageNumber, pageSize, searchLoginTerm, searchEmailTerm} = sortData

      let query = UserModel.find()
      let queryForCount = UserModel.find()

      if (searchLoginTerm || searchEmailTerm) {
        const regExpLogin = new RegExp(searchLoginTerm as string, 'i')
        const regExpEmail = new RegExp(searchEmailTerm as string, 'i')

        query.or([{ login: regExpLogin }, { email: regExpEmail }])
        queryForCount.or([{ login: regExpLogin }, { email: regExpEmail }])
      }

      const users = await query
        .sort({[sortBy]: sortDirection})
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean()

      const totalCount = await queryForCount.countDocuments()
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
      const user = await UserModel.findOne({_id: new ObjectId(userId)}).lean()
      if (!user) return null

      return {email: user.email, login: user.login, userId: user._id.toString()}
    } catch (e) {
      return null
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