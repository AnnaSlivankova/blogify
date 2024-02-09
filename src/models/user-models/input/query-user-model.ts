import {SortDirection} from "mongodb";

export type QueryUserModel = {
  sortBy?: string
  sortDirection?: SortDirection
  pageNumber?: number
  pageSize?: number
  searchLoginTerm?: string
  searchEmailTerm?: string
}