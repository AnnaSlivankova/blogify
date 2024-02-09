import {blogsCollection, postsCollection, usersCollection} from "../db/db";

export class TestingAllDataRepository {
  static async deleteAllData() {
    await blogsCollection.deleteMany({})
    await postsCollection.deleteMany({})
    await usersCollection.deleteMany({})

    // await db.dropDatabase() //но нужны админские права для дропа всей БД

    return
  }

}