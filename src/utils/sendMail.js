// src/utils/sendMail.js
import nodemailer from 'nodemailer';

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  SMTP_FROM,
} = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: Number(SMTP_PORT) === 465, // 465 - SSL, 587 - TLS
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

/**
 * Загальна утиліта відправки листів.
 * Приймає об'єкт options, який напряму передається в transporter.sendMail.
 * Якщо from не вказано, підставляємо SMTP_FROM за замовчуванням.
 */
export async function sendEmail(options) {
  const finalOptions = {
    from: SMTP_FROM,
    ...options,
  };

  
  return transporter.sendMail(finalOptions);
}
