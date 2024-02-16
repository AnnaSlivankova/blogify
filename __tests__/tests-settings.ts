import {app, SETTINGS} from "../src/app";
import {agent} from "supertest";

export const req = agent(app)

export const commonHeaders = {
  "authorization": `Basic ${SETTINGS.AUTH_CRED}`
}

