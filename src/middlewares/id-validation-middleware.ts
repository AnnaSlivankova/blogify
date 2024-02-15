import {NextFunction, Request, Response} from "express";
import {ObjectId} from "mongodb";

export const idValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id

  if (!ObjectId.isValid(id)) {
    res.sendStatus(404)
    return
  }

  return next()
}