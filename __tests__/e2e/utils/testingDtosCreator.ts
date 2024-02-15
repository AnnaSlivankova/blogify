export const testingDtosCreator = {
  createUserDto() {
    return {
      login: 'test',
      email: 'test@gmail.com',
      password: '1234567'
    }
  },
  createUserDtos(count: number) {
    const users = []

    for (let i = count; i <= count; i++) {
      users.push({
        login: 'test' + i,
        email: `test${i}@gmail.com`,
        password: '1234567'
      })
    }
    return users
  }
}