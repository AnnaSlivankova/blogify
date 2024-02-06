import {NextFunction, Request, Response} from "express";
import {SETTINGS} from "../../app";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  //simple auth check
  // if (req.headers["authorization"] !== 'Basic YWRtaW46cXdlcnR5') {
  //   res.sendStatus(401)
  //   return
  // }

  const auth = req.headers["authorization"]

  if (!auth) {
    res.sendStatus(401)
    return
  }

  const [basic, token] = auth?.split(' ')

  if (basic !== 'Basic') {
    res.sendStatus(401)
    return
  }

  const decodedToken = new Buffer(token, 'base64').toString()
  // const decodedToken = Buffer.from(token, 'utf-8').toString('base64')

  const [login, password] = decodedToken.split(':')

  if (login !== SETTINGS.LOGIN_CRED || password !== SETTINGS.PASS_CRED) {
    res.sendStatus(401)
    return
  }

  return next()
}