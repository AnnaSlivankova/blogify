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


export enum StatusCodes {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,

  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,

  TOO_MANY_REQUESTS = 429,

  INTERNAL_SERVER_ERROR = 500,
}

export type ObjectResult<D = null> = {
  status: StatusCodes
  errorMessages?: string
  data?: D
}