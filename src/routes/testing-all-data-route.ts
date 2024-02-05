import {Request, Response, Router} from "express";
import {TestingAllDataRepository} from "../repositories/testing-all-data-repository";

export const testingAllDataRoute = Router({})

testingAllDataRoute.delete('/', async (req: Request, res: Response) => {

  await TestingAllDataRepository.deleteAllData()

  res.sendStatus(204)
})