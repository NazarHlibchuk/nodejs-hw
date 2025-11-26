// src/middleware/errorHandler.js
import createHttpError from 'http-errors';

export function errorHandler(err, req, res, next) {
  if (req?.log) {
    req.log.error({ err }, 'Unhandled error');
  } else {
    console.error(err);
  }

  // якщо це HttpError або інша помилка зі статусом — беремо його
  const status =
    err.status ||
    err.statusCode ||
    (createHttpError.isHttpError && createHttpError.isHttpError(err) && err.status) ||
    500;

  // важливо: завжди віддаємо message з помилки, якщо він є
  const message =
    (typeof err.message === 'string' && err.message.trim()) ||
    'Internal Server Error';

  res.status(status).json({ message });
}

