// src/middleware/errorHandler.js
import createHttpError from 'http-errors';

export function errorHandler(err, req, res, next) {
  // Логуємо все, але не «світимо» зайвого клієнту
  if (req?.log) req.log.error({ err }, 'Unhandled error');

  let status = 500;
  let message = 'Internal Server Error';

  // Якщо це саме HttpError з http-errors — поважаємо його статус/експонування
  const isHttp =
    (typeof createHttpError.isHttpError === 'function' && createHttpError.isHttpError(err)) ||
    (createHttpError.HttpError && err instanceof createHttpError.HttpError);

  if (isHttp) {
    status = err.status ?? err.statusCode ?? 500;
    // http-errors має прапорець expose: для 4xx true, для 5xx false
    message = err.expose ? err.message : message;
  } else if (typeof err.status === 'number') {
    // Негарантовані «нестандартні» помилки з полем status
    status = err.status;
    message = err.message || message;
  }

  res.status(status).json({ message });
}
