import {Request, Response, Router} from "express";
import {Pagination, RequestWithBody, RequestWithQuery} from "../types";
import {QueryUserModel} from "../models/user-models/input/query-user-model";
import {UserQueryRepository} from "../repositories/user-query-repository";
import {UserViewModel} from "../models/user-models/output/user-view-model";
import {authMiddleware} from "../middlewares/auth/auth-middleware";
import {userValidation} from "../validators/user-validators";
import {CreateUserModel} from "../models/user-models/input/create-user-model";
import {UserService} from "../services/user-service";
import {ObjectId} from "mongodb";

export const userRoute = Router({})

userRoute.get('/', authMiddleware, async (req: RequestWithQuery<QueryUserModel>, res: Response<Pagination<UserViewModel>>) => {
  const sortData = {
    sortBy: req.query.sortBy ?? 'createdAt',
    sortDirection: req.query.sortDirection ?? 'desc',
    pageSize: req.query.pageSize ? +req.query.pageSize : 10,
    pageNumber: req.query.pageNumber ? +req.query.pageNumber : 1,
    searchEmailTerm: req.query.searchEmailTerm ?? null,
    searchLoginTerm: req.query.searchLoginTerm ?? null
  }

  const users = await UserQueryRepository.getAllUsers(sortData)

  if (!users) {
    res.sendStatus(404)
    return
  }

  res.status(200).send(users)
})

userRoute.post('/', authMiddleware, userValidation(), async (req: RequestWithBody<CreateUserModel>, res: Response<UserViewModel>) => {
  const createUserModel = {
    email: req.body.email,
    login: req.body.login,
    password: req.body.password,
  }

  const user = await UserService.createUser(createUserModel)

  if (!user) {
    res.sendStatus(404)
    return
  }

  res.status(201).send(user)
})

userRoute.delete('/:id', authMiddleware, async (req: Request<{ id: string }>, res: Response<void>) => {
  const id = req.params.id

  if (!ObjectId.isValid(id)) {
    res.sendStatus(404)
    return
  }

  const isUserDeleted = await UserService.deleteUser(id)

  if (!isUserDeleted) {
    res.sendStatus(404)
    return
  }

  res.sendStatus(204)
})