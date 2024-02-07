import {SortDirection} from "mongodb";

export type QueryBlogModel = {
  searchNameTerm?: string
  sortBy?: string
  sortDirection?: SortDirection
  pageNumber?: number
  pageSize?: number
}