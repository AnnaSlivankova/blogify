import {app, SETTINGS} from "../src/app";
import {agent} from "supertest";
import 'dotenv/config'
import {BlogViewModel} from "../src/models/blog-models/output/blog-view-model";
import {CreateBlogModel} from "../src/models/blog-models/input/create-blog-model";
import {MongoClient} from "mongodb";

const req = agent(app)

const commonHeaders = {
  "authorization": `Basic ${SETTINGS.AUTH_CRED}`
}

const mongoURI = process.env.MONGO_URL

describe('/blogs', () => {
  let createdBlog: BlogViewModel

  if (!mongoURI) {
    return console.log('invalid mongoURI:', mongoURI)
  }

  const client = new MongoClient(mongoURI)

  beforeAll(async () => {
    await client.connect()
    await req.delete('/testing/all-data').expect(204)
  })

  afterAll(async () => {
    await client.close()
  })

  it('GET blogs = []', async () => {
    await req.get('/blogs').expect([])
  })

  it('- POST should not create blog with incorrect data (name/description/websiteUrl)', async () => {

    const res = await req.post('/blogs').set(commonHeaders).send({
      name: 'invalid name value',
      websiteUrl: 'invalid websiteUrl value'
    }).expect(400)

    expect(res.body.errorsMessages.length).toBe(3)
    expect(res.body.errorsMessages[0].field).toStrictEqual("name")
    expect(res.body.errorsMessages[1].field).toStrictEqual("description")
    expect(res.body.errorsMessages[2].field).toStrictEqual("websiteUrl")
  })

  it('- POST should return 401', async () => {
    await req.post("/blogs").expect(401)
  })

  it('POST should create new blog', async () => {

    const newBlog: CreateBlogModel = {
      name: 'correct name',
      description: 'correct description',
      websiteUrl: 'https://correct-url.com'
    }

    const res = await req.post('/blogs').set(commonHeaders).send(newBlog).expect(201)

    createdBlog = res.body

    const {id, websiteUrl, description, name} = res.body as BlogViewModel

    expect(id).toBeDefined()
    expect(name).toStrictEqual(newBlog.name)
    expect(websiteUrl).toStrictEqual(newBlog.websiteUrl)
    expect(description).toStrictEqual(newBlog.description)

    const res2 = await req.get('/blogs')
    expect(res2.body.length).toBe(1)
  })

  it('- GET should return 404 when id is not correct', async () => {
    await req.get('/blogs/incorrect-id').expect(404)
  })

  it('GET should return blog by its id', async () => {
    const res = await req.get(`/blogs/${createdBlog.id}`).expect(200)

    expect(res.body.id).toStrictEqual(createdBlog.id)
  })

  it('- PUT should not update blog with incorrect data (name/description/websiteUrl)', async () => {

    const res = await req.put(`/blogs/${createdBlog.id}`).set(commonHeaders).send({
      name: 'invalid name value',
      websiteUrl: 'invalid websiteUrl value'
    }).expect(400)

    expect(res.body.errorsMessages.length).toBe(3)
    expect(res.body.errorsMessages[0].field).toStrictEqual("name")
    expect(res.body.errorsMessages[1].field).toStrictEqual("description")
    expect(res.body.errorsMessages[2].field).toStrictEqual("websiteUrl")
  })

  it('- PUT should return 401', async () => {
    await req.put(`/blogs/${createdBlog.id}`).expect(401)
  })

  it('- PUT should return 404 when id is not correct', async () => {
    await req.put(`/blogs/incorrect-id`).set(commonHeaders).send({
      name: 'updated name',
      description: "updated description",
      websiteUrl: 'https://updated-url.com'
    }).expect(404)
  })

  it('PUT should update blog by id', async () => {

    await req.put(`/blogs/${createdBlog.id}`).set(commonHeaders).send({
      name: 'updated name',
      description: "updated description",
      websiteUrl: 'https://updated-url.com'
    }).expect(204)

    const res = await req.get(`/blogs/${createdBlog.id}`).expect(200)

    expect(res.body.id).toStrictEqual(createdBlog.id)
    expect(res.body.name).toStrictEqual('updated name')
    expect(res.body.description).toStrictEqual("updated description")
    expect(res.body.websiteUrl).toStrictEqual('https://updated-url.com')
  })

  it('- DELETE should return 401', async () => {
    await req.delete(`/blogs/${createdBlog.id}`).expect(401)
  })

  it('- DELETE should return 404 when blog-id is not found', async () => {
    await req.delete("/blogs/incorrect-id").set(commonHeaders).expect(404)
  })

  it('DELETE blog by id', async () => {
    await req.delete(`/blogs/${createdBlog.id}`).set(commonHeaders).expect(204)

    await req.get('/blogs').expect([])
  })

})