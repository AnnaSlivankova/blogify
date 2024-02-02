import {Request, Response, Router} from "express";
import {authMiddleware} from "../middlewares/auth/auth-middleware";
import {PostViewModel} from "../models/post-models/PostViewModel";
import {PostRepository} from "../repositories/post-repository";
import {CreatePostModel} from "../models/post-models/CreatePostModel";
import {RequestWithBody, RequestWithParamsAndBody} from "../types";
import {postValidation} from "../validators/post-validators";
import {UpdatePostModel} from "../models/post-models/UpdatePostModel";

export const postRoute = Router({})

postRoute.get('/', (req: Request, res: Response<PostViewModel[]>) => {

  const posts = PostRepository.getAll()

  res.status(200).send(posts)
})

postRoute.post('/', authMiddleware, postValidation(), (req: RequestWithBody<CreatePostModel>, res: Response<PostViewModel>) => {

  const createdPost = PostRepository.createPost(req.body)

  res.status(201).send(createdPost)
})

postRoute.get('/:id', (req: Request<{ id: string }>, res: Response<PostViewModel>) => {

  const post = PostRepository.getPostById(req.params.id)

  if (!post) {
    res.sendStatus(404)
    return
  }

  res.status(200).send(post)
})

postRoute.put('/:id', authMiddleware, postValidation(), (req: RequestWithParamsAndBody<{
  id: string
}, UpdatePostModel>, res: Response) => {

  if (!PostRepository.getPostById(req.params.id)) {
    res.sendStatus(404)
    return
  }

  PostRepository.updatePost({id: req.params.id, updateData: req.body})

  res.sendStatus(204)
})

postRoute.delete('/:id', authMiddleware, (req: Request<{ id: string }>, res: Response) => {

  if (!PostRepository.getPostById(req.params.id)) {
    res.sendStatus(404)
    return
  }

  PostRepository.deletePost(req.params.id)

  res.sendStatus(204)
})