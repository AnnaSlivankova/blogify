import express, {json, Request, Response} from "express";

export const app = express()

app.use(json())

export const getInitialData = (req: Request, res: Response) => {
  res.status(200).json({"TEST-DATA": "SUCCESS"})
}

app.get('/', getInitialData)