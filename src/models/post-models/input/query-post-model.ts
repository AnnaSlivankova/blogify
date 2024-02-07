import {SortDirection} from "mongodb";

export type QueryPostModel = {
  pageNumber?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: SortDirection
}