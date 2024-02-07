import {Request} from "express";

export type RequestWithBody<T> = Request<{}, {}, T>
export type RequestWithQuery<T> = Request<{}, {}, {}, T>
export type RequestWithParamsAndBody<T, B> = Request<T, {}, B>
export type RequestWithParamsAndQuery<P, Q> = Request<P, {}, {}, Q>


export type Pagination<I> = {
  pagesCount: number
  page: number
  pageSize: number
  totalCount: number
  items: I[]
}

export type ErrorResponse = {
  errorsMessages: ErrorMessage[]
}

export type ErrorMessage = { message: string, field: string }