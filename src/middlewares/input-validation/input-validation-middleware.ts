import {NextFunction, Request, Response} from "express";
import {Result, ValidationError, validationResult} from "express-validator";
import {ErrorMessage, ErrorResponse} from "../../types";

export const inputValidationMiddleware = (req: Request, res: Response<ErrorResponse>, next: NextFunction) => {

  const formattedError: Result<ErrorMessage> = validationResult(req).formatWith((error: ValidationError) => ({
    message: error.msg,
    field: error.type === 'field' ? error.path : 'field in not found'
  }))

  if (!formattedError.isEmpty()) {
    const errorsMessages = formattedError.array({onlyFirstError: true}) //можно обойти .bail() но писать его после каждой проверки в ВАЛИДАТОРЕ

    res.status(400).send({errorsMessages: errorsMessages})

    return
  }

  return next()
}