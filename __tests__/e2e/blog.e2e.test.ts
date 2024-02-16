import {PATH, SETTINGS} from "../../src/app";
import {MongoClient} from "mongodb";
import {commonHeaders, req} from "../tests-settings";
import {MongoMemoryServer} from "mongodb-memory-server";
import {paginatedEmptyResponse, testSeeder} from "../test.seeder";


describe('BLOGS_E2E', () => {
  let client: MongoClient

  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create()
    SETTINGS.MONGO_URL = mongoServer.getUri()
    client = new MongoClient(SETTINGS.MONGO_URL)
    await client.connect()
  })

  afterAll(async () => {
    await req.delete(PATH.TESTING).expect(204)
    await client.close()
  })

  describe('Testing blogs CRUDS', () => {
    beforeEach(async () => {
      await req.delete(PATH.TESTING).expect(204)
    })

    it('GET blogs should return default pagination values and empty items[]', async () => {
      await req.get(PATH.BLOGS).expect(paginatedEmptyResponse)
    })

    it('- POST should not create blog with incorrect data (name/description/websiteUrl)', async () => {
      const res = await req.post(PATH.BLOGS).set(commonHeaders).send({
        name: 'invalid name value',
        websiteUrl: 'invalid websiteUrl value'
      }).expect(400)

      expect(res.body.errorsMessages.length).toBe(3)
      expect(res.body.errorsMessages[0].field).toStrictEqual("name")
      expect(res.body.errorsMessages[1].field).toStrictEqual("description")
      expect(res.body.errorsMessages[2].field).toStrictEqual("websiteUrl")
    })

    it('- POST should return 401', async () => {
      await req.post(PATH.BLOGS).expect(401)
    })

    it('POST should create new blog', async () => {
      const blogDto = testSeeder.createBlogDto()
      const res = await req.post(PATH.BLOGS).set(commonHeaders).send(blogDto).expect(201)

      // createdBlog = res.body

      const {id, websiteUrl, description, name} = res.body

      expect(id).toBeDefined()
      expect(name).toStrictEqual(blogDto.name)
      expect(websiteUrl).toStrictEqual(blogDto.websiteUrl)
      expect(description).toStrictEqual(blogDto.description)

      const allBlogsFromDB = await req.get(PATH.BLOGS)
      expect(allBlogsFromDB.body.items.length).toBe(1)
    })

    it('- GET should return 404 when id is not correct', async () => {
      await req.get(`${PATH.BLOGS}/incorrect-id`).expect(404)
    })

    it('GET should return blog by its id', async () => {
      const createdBlog = await testSeeder.createBlogDtoInDb()
      const res = await req.get(`${PATH.BLOGS}/${createdBlog.id}`).expect(200)

      expect(res.body.id).toStrictEqual(createdBlog.id)
    })

    it('- PUT should not update blog with incorrect data (name/description/websiteUrl)', async () => {
      const createdBlog = await testSeeder.createBlogDtoInDb()
      const res = await req.put(`${PATH.BLOGS}/${createdBlog.id}`).set(commonHeaders).send({
        name: 'invalid name value',
        websiteUrl: 'invalid websiteUrl value'
      }).expect(400)

      expect(res.body.errorsMessages.length).toBe(3)
      expect(res.body.errorsMessages[0].field).toStrictEqual("name")
      expect(res.body.errorsMessages[1].field).toStrictEqual("description")
      expect(res.body.errorsMessages[2].field).toStrictEqual("websiteUrl")
    })

    it('- PUT should return 401', async () => {
      const createdBlog = await testSeeder.createBlogDtoInDb()
      await req.put(`${PATH.BLOGS}/${createdBlog.id}`).set({'Authorization': 'scj32039wncw'}).send({}).expect(401)
    })

    it('- PUT should return 404 when id is not correct', async () => {
      await req.put(`${PATH.BLOGS}/incorrect-id`).set(commonHeaders).send({}).expect(404)
    })

    it('PUT should update blog by id', async () => {
      const createdBlog = await testSeeder.createBlogDtoInDb()

      await req.put(`${PATH.BLOGS}/${createdBlog.id}`).set(commonHeaders).send({
        name: 'updated name',
        description: "updated description",
        websiteUrl: 'https://updated-url.com'
      }).expect(204)

      const res = await req.get(`${PATH.BLOGS}/${createdBlog.id}`).expect(200)

      expect(res.body.id).toStrictEqual(createdBlog.id)
      expect(res.body.name).toStrictEqual('updated name')
      expect(res.body.description).toStrictEqual("updated description")
      expect(res.body.websiteUrl).toStrictEqual('https://updated-url.com')
    })

    it('- DELETE should return 401', async () => {
      const createdBlog = await testSeeder.createBlogDtoInDb()
      await req.delete(`${PATH.BLOGS}/${createdBlog.id}`).set({'Authorization': 'scj32039wncw'}).expect(401)
    })

    it('- DELETE should return 404 when blog-id is not found', async () => {
      await req.delete(`${PATH.BLOGS}/incorrect-id`).set(commonHeaders).expect(404)
    })

    it('DELETE blog by id should return default pagination values and empty items[]', async () => {
      const createdBlog = await testSeeder.createBlogDtoInDb()
      await req.delete(`${PATH.BLOGS}/${createdBlog.id}`).set(commonHeaders).expect(204)

      await req.get(PATH.BLOGS).expect(paginatedEmptyResponse)
    })
  })

  describe('GET request with query params', () => {
    beforeAll(async () => {
      await req.delete(PATH.TESTING).expect(204)
      await testSeeder.createBlogsDtosInDb(23)
    })

    it('GET should return array with 10 items and pageCount 3', async () => {
      const res = await req.get(PATH.BLOGS)

      expect(res.body.items.length).toBe(10)
      expect(res.body.items[0].name).toBe('23name')
      expect(res.body.pagesCount).toBe(3)
    })

    it('GET should return array with 1 items and pageCount 1', async () => {
      const res = await req.get(PATH.BLOGS).query({searchNameTerm: '12name'})

      expect(res.body.items.length).toBe(1)
      expect(res.body.pagesCount).toBe(1)
    })

    it('GET should return array with 20 items/pageCount 2/name:1name', async () => {
      const res = await req.get(PATH.BLOGS).query({sortDirection: 'asc', pageSize: 20})

      expect(res.body.items.length).toBe(20)
      expect(res.body.items[0].name).toBe('1name')
      expect(res.body.pageSize).toBe(20)
      expect(res.body.pagesCount).toBe(2)
    })

    it('GET should return array with 3 items/pageCount 1/name:22name', async () => {
      const res = await req.get(PATH.BLOGS).query({searchNameTerm: '2name'})

      expect(res.body.items.length).toBe(3)
      expect(res.body.items[0].name).toBe('22name')
      expect(res.body.pagesCount).toBe(1)
    })

    it('GET should return default pagination values and empty items[]', async () => {
      const res = await req.get(PATH.BLOGS).query({searchNameTerm: 'nfjkkd'})

      expect(res.body.items.length).toBe(0)
      expect(res.body.pagesCount).toBe(0)
      expect(res.body.page).toBe(1)
    })
  })

  describe('Create post for specific blog / GET all posts by blogId', () => {
    let blogId: string

    beforeAll(async () => {
      await req.delete(PATH.TESTING).expect(204)
      const res = await req.post(PATH.BLOGS).set(commonHeaders).send(testSeeder.createBlogDto()).expect(201)
      blogId = res.body.id
    })

    it('- POST should not create post and return 401 status', async () => {
      await req.post(`${PATH.BLOGS}/${blogId}/posts`).set({'Authorization': 'ndjids7k3j'}).send({}).expect(401)
    })

    it('- POST should not create post with incorrect input-data', async () => {
      const res = await req.post(`${PATH.BLOGS}/${blogId}/posts`).set(commonHeaders).send({
        content: '',
        title: '    ',
      }).expect(400)

      expect(res.body.errorsMessages.length).toBe(3)
      expect(res.body.errorsMessages[0].field).toStrictEqual("title")
      expect(res.body.errorsMessages[1].field).toStrictEqual("shortDescription")
      expect(res.body.errorsMessages[2].field).toStrictEqual("content")
    })

    it('POST should create post for specific blog', async () => {
      const res = await req.post(`${PATH.BLOGS}/${blogId}/posts`).set(commonHeaders).send(testSeeder.createPostDto(blogId)).expect(201)

      expect(res.body.blogId).toStrictEqual(blogId)
      expect(res.body.id).toBeDefined()

      const postsRes = await req.get(PATH.POSTS).expect(200)

      expect(postsRes.body.items.length).toBe(1)
    })

    it('GET should return all posts for specific blog', async () => {
      await req.post(`${PATH.BLOGS}/${blogId}/posts`).set(commonHeaders).send(testSeeder.createPostDto(blogId)).expect(201)

      const res = await req.get(`${PATH.BLOGS}/${blogId}/posts`).expect(200)

      expect(res.body.items.length).toBe(2)
    })
  })
})