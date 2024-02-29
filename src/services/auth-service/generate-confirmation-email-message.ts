export const generateConfirmationEmailMessage = (userId: string, code: string, type: string) => {
  return (
    `<h1>Пожалуйста, подтвердите ваш адрес электронной почты, перейдя по ссылке:</h1>
           <a href="http://localhost:3000/auth/registration-confirmation?${type}=${userId} ${code}">Подтвердить</a>`
  )
}