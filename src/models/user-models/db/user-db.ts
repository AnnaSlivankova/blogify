export type UserDb = {
  login: string
  email: string
  createdAt: string
  hash: string

  emailConfirmation?: {
    confirmationCode?: string
    expirationDare?: Date
    isConfirmed?: boolean
  }
}