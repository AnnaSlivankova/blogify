import {db} from "../db/db";

export class TestingAllDataRepository {
  static deleteAllData() {
    db.blogs = []
    db.posts = []

    return
  }

}