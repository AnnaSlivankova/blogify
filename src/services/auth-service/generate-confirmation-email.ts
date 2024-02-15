export const generateConfirmationEmail = (userId: string, code: string) => {
  return (
    `<h1>Пожалуйста, подтвердите ваш адрес электронной почты, перейдя по ссылке:</h1>
           <a href="http://localhost:3000/auth/registration-confirmation?code=${userId} ${code}">Подтвердить</a>`
  )
}