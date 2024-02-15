import {PATH} from "../../../src/app";
import {commonHeaders, req} from "./tests-settings";

export const createUserDto = async () => {
  const res = await req.post(PATH.USERS).set(commonHeaders).send({
    email: 'test@gmail.com',
    login: 'test',
    password: '1234567'
  }).expect(201)
  return res.body
}

export const createUsersDtos = async (count: number) => {
  const users = []

  for (let i = 0; i < count; i++) {
    const res = await req.post(PATH.USERS).set(commonHeaders).send({
      email: `test${i}@gmail.com`,
      login: 'test' + i,
      password: '1234567'
    }).expect(201)

    users.push(res.body)
  }
  return users
}