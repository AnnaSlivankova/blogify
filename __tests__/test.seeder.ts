import {commonHeaders, req} from "./tests-settings";
import {PATH} from "../src/app";
import {CreateBlogModel} from "../src/models/blog-models/input/create-blog-model";
import {CreatePostModel} from "../src/models/post-models/input/create-post-model";
import {BlogViewModel} from "../src/models/blog-models/output/blog-view-model";
import {PostViewModel} from "../src/models/post-models/output/post-view-model";
import {UserViewModel} from "../src/models/user-models/output/user-view-model";

export const testSeeder = {
  //BLOGS
  createBlogDto(): CreateBlogModel {
    return {
      name: 'correct name',
      description: 'correct description',
      websiteUrl: 'https://correct-url.com'
    }
  },

  async createBlogDtoInDb(): Promise<BlogViewModel> {
    const res = await req.post(PATH.BLOGS).set(commonHeaders).send(this.createBlogDto()).expect(201)

    return res.body
  },

  async createBlogsDtosInDb(count: number): Promise<BlogViewModel[]> {
    let blogs: BlogViewModel[] = []

    for (let i = 0; i < count; i++) {
      const res = await req.post(PATH.BLOGS).set(commonHeaders).send({
        name: `${i + 1}name`,
        description: 'correct description',
        websiteUrl: 'https://correct-url.com'
      }).expect(201)
      blogs.push(res.body)
    }
    return blogs
  },

  //POSTS
  createPostDto(blogId: string): CreatePostModel {
    return {
      blogId,
      content: 'some content',
      title: 'some title',
      shortDescription: 'some short description'
    }
  },

  async createPostDtoInDb(blogId: string): Promise<PostViewModel> {
    const res = await req.post(PATH.POSTS).set(commonHeaders).send(this.createPostDto(blogId)).expect(201)

    return res.body
  },

  //USERS
  createUserDto() {
    return {
      login: 'test',
      email: 'test@gmail.com',
      password: '1234567'
    }
  },

  createUsersDtos(count: number) {
    const users = []

    for (let i = 0; i <= count; i++) {
      users.push({
        login: 'test' + i,
        email: `test${i}@gmail.com`,
        password: '1234567'
      })
    }
    return users
  },

  async createUserDtoInDb(): Promise<UserViewModel> {
    const res = await req.post(PATH.USERS).set(commonHeaders).send({
      email: 'test@gmail.com',
      login: 'test',
      password: '1234567'
    }).expect(201)

    return res.body
  },

  async createUsersDtosInDb(count: number) {
    const users = []

    for (let i = 0; i < count; i++) {
      const res = await req.post(PATH.USERS).set(commonHeaders).send({
        email: `test${i}@gmail.com`,
        login: 'test' + i,
        password: '1234567'
      }).expect(201)

      users.push(res.body)
    }
    return users;
  },

  //AUTH
  async loginUser(loginOrEmail: string, password: string): Promise<{ accessToken: string }> {
    const res = await req.post(`${PATH.AUTH}/login`).send({loginOrEmail, password}).expect(200)

    return res.body
  }


//COMMENTS


}

export const paginatedEmptyResponse = {
  pagesCount: 0,
  page: 1,
  pageSize: 10,
  totalCount: 0,
  items: []
} as const