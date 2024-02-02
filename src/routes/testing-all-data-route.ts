import {Request, Response, Router} from "express";
import {TestingAllDataRepository} from "../repositories/testing-all-data-repository";

export const testingAllDataRoute = Router({})

testingAllDataRoute.delete('/', (req: Request, res: Response) => {

  TestingAllDataRepository.deleteAllData()

  res.sendStatus(204)
})