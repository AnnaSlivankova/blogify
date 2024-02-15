import {Request, Response, Router} from "express";
import {authJwtMiddleware} from "../middlewares/auth/auth-jwt-middleware";
import {commentValidation} from "../validators/comment-validators";
import {RequestWithParamsAndBody} from "../types";
import {UpdateCommentModel} from "../models/comment-models/input/update-comment-model";
import {CommentService} from "../services/comment-service";
import {CommentQueryRepository} from "../repositories/comment-query-repository";
import {CommentRepository} from "../repositories/comment-repository";
import {idValidationMiddleware} from "../middlewares/id-validation-middleware";

export const commentRoute = Router({})

commentRoute.put('/:id', authJwtMiddleware, idValidationMiddleware, commentValidation(), async (req: RequestWithParamsAndBody<{
  id: string
}, UpdateCommentModel>, res: Response) => {
  const id = req.params.id

  const commentForUpdate = await CommentRepository.getCommentById(id)

  if (!commentForUpdate) {
    res.sendStatus(404)
    return
  }

  if (commentForUpdate.commentatorInfo.userId !== req.user!._id.toString()) {
    res.sendStatus(403)
    return
  }

  const newComment = {
    content: req.body.content
  }

  const isCommentUpdated = await CommentService.updateComment(id, newComment)

  if (!isCommentUpdated) {
    res.sendStatus(404)
    return
  }

  res.sendStatus(204)
})

commentRoute.delete('/:id', authJwtMiddleware, idValidationMiddleware, async (req: Request<{
  id: string
}>, res: Response) => {
  const id = req.params.id

  const commentForDelete = await CommentRepository.getCommentById(id)

  if (!commentForDelete) {
    res.sendStatus(404)
    return
  }

  if (commentForDelete.commentatorInfo.userLogin !== req.user!.login) {
    res.sendStatus(403)
    return
  }

  const isCommentDeleted = await CommentService.deleteCommentById(id)

  if (!isCommentDeleted) {
    res.sendStatus(404)
    return
  }

  return res.sendStatus(204)
})

commentRoute.get('/:id', idValidationMiddleware, async (req: Request<{ id: string }>, res: Response) => {
  const id = req.params.id

  const comment = await CommentQueryRepository.getCommentById(id)

  if (!comment) {
    res.sendStatus(404)
    return
  }

  res.status(200).send(comment)
})