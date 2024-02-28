import {commonHeaders, req} from "./tests-settings";
import {PATH} from "../src/app";
import {CreateBlogModel} from "../src/models/blog-models/input/create-blog-model";
import {CreatePostModel} from "../src/models/post-models/input/create-post-model";
import {BlogViewModel} from "../src/models/blog-models/output/blog-view-model";
import {PostViewModel} from "../src/models/post-models/output/post-view-model";
import {UserViewModel} from "../src/models/user-models/output/user-view-model";
import {BcryptService} from "../src/services/bcrypt-service";
import {UserDb} from "../src/models/user-models/db/user-db";
import {add} from "date-fns";
import {AuthRepository} from "../src/repositories/auth-repository";
import {UserService} from "../src/services/user-service";
import {ObjectId, WithId} from "mongodb";
import {AuthService} from "../src/services/auth-service/auth-service";
import {SecurityDevicesQueryRepository} from "../src/repositories/security-devices-query-repository";
import {JwtService} from "../src/services/jwt-service";

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
      // email: 'test@gmail.com',
      email: 'annslivankova@gmail.com',
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
  async getUserFromDb(userId: ObjectId) {
    return await UserService.getUserById(userId)
  },

  async getAllUsersFromDb() {
    const res = await req.get(PATH.USERS).set(commonHeaders).expect(200)
    return res.body
  },


  //AUTH

  async registerUser() {
    const email = 'test@gmail.com'
    const login = 'test'
    const password = '1234567'
    const hash = await BcryptService.generateHash(password)

    const newUser: UserDb = {
      email,
      login,
      createdAt: new Date().toISOString(),
      hash,
      emailConfirmation: {
        confirmationCode: '12345',
        expirationDare: add(new Date(), {
          hours: 1,
          minutes: 2
        }),
        isConfirmed: false
      }
    }

    return await AuthRepository.createUser(newUser)
  },
  async registerConfirmedUser() {
    const email = 'test@gmail.com'
    const login = 'test'
    const password = '1234567'
    const hash = await BcryptService.generateHash(password)

    const newUser: UserDb = {
      email,
      login,
      createdAt: new Date().toISOString(),
      hash,
      emailConfirmation: {
        confirmationCode: '12345',
        expirationDare: add(new Date(), {
          hours: 1,
          minutes: 2
        }),
        isConfirmed: true
      }
    }

    return await AuthRepository.createUser(newUser)
  },

  async registerConfirmedUsers(count: number) {
    let users: WithId<UserDb>[] = []

    for (let i = 0; i < count; i++) {
      const password = '1234567'
      const hash = await BcryptService.generateHash(password)

      const newUser: UserDb = {
        email: i + 'test@gmail.com',
        login: 'test' + i,
        createdAt: new Date().toISOString(),
        hash,
        emailConfirmation: {
          confirmationCode: '12345',
          expirationDare: add(new Date(), {
            hours: 1,
            minutes: 2
          }),
          isConfirmed: true
        }
      }

      const res = await AuthRepository.createUser(newUser)

      users.push(res!)
    }

    return users
  },

  async loginUser() {
    const user = await this.registerConfirmedUser()
    const res = await req
      .post(PATH.AUTH + '/login')
      .send({loginOrEmail: user!.login, password: '1234567'})
      .expect(200)

    const refreshToken = res.headers['set-cookie']
    const accessToken = res.body.accessToken

    return {refreshToken, accessToken}
  },


//COMMENTS

  async createBlogWithPostInDb() {
    const blog = await this.createBlogDtoInDb()
    const post = await this.createPostDtoInDb(blog.id)

    return post.id
  },

  async createCommentInDb() {
    const postId = await this.createBlogWithPostInDb()
    const {accessToken} = await this.loginUser()

    const comment = await req
      .post(`${PATH.POSTS}/${postId}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({content: 'comment more than 20 sym'})
      .expect(201)

    return {
      accessToken: accessToken,
      comment: comment.body,
    }
  },

  async createCommentsInDb(count: number) {
    const postId = await this.createBlogWithPostInDb()
    const {accessToken} = await this.loginUser()
    let comments = []

    for (let i = 0; i <= count; i++) {
      const comment = await req
        .post(`${PATH.POSTS}/${postId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({content: 'comment more than 20 sym' + i})
        .expect(201)

      comments.push(comment)
    }

    return {comments, id: postId, accessToken}
  },

  async getAllComments(postId: string) {
    const res = await req.get(`${PATH.POSTS}/${postId}/comments`).expect(200)
    return res.body
  },

  // SECURITY-DEVICES

  async loginFrom4DifDevices() {
    const {refreshToken, accessToken} = await this.loginUser()
    const userId = await JwtService.getUserIdByToken(accessToken)

    const ip = '192.168.123.132'
    const loginOrEmail = 'test@gmail.com'
    const password = '1234567'
    const headers = [
      'samsung',
      'tablet',
      'iPhone',
      'web'
    ]

    for (let i = 0; i <= 4; i++) {
      await AuthService.login(loginOrEmail, password, ip, headers[i])
    }
    return {refreshToken, userId}
  },

  async getAllDeviceSessions(userId: string) {
    return await SecurityDevicesQueryRepository.getAllActiveSessions(userId)
  },

  //rate limit
  async login(loginOrEmail: string, password: string, status: number = 200) {
    return await req.post('/auth/login').send({loginOrEmail, password}).expect(status)
  },

  async registration(login: string, email: string, password: string, status: number = 204) {
    return await req.post('/auth/registration').send({login, email, password}).expect(status)
  },

  async registrationConfirmation(code: string, status: number = 204) {
    return await req.post('/auth/registration-confirmation').send({code}).expect(status)
  },

}

export const paginatedEmptyResponse = {
  pagesCount: 0,
  page: 1,
  pageSize: 10,
  totalCount: 0,
  items: []
} as const