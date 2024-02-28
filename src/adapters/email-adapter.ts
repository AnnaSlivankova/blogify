import nodemailer from 'nodemailer'
import {SETTINGS} from "../app";

export const emailAdapter = {
  async sendEmail(email: string, subject: string, message: string) {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: SETTINGS.CORP_EMAIL,
        pass: SETTINGS.CORP_PASS
      }
    })

    const mailOptions = {
      from: `Blogify team <${SETTINGS.CORP_EMAIL}>`,
      to: email,
      subject: subject,
      html: message
    }

    const info = await transporter.sendMail(mailOptions)

    if (!info) return false

    return !!info
  }
}