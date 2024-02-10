import {SortDirection} from "mongodb";

export type QueryCommentModal = {
  pageNumber?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: SortDirection
}