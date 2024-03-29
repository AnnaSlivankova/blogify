export type UserDb = {
  login: string
  email: string
  createdAt: string
  hash: string

  emailConfirmation?: {
    confirmationCode?: string
    expirationDate?: Date
    isConfirmed?: boolean
  }

  passwordRecovery?: {
    recoveryCode?: string
    expirationDate?: Date
    updatedAt?: string
  }
}