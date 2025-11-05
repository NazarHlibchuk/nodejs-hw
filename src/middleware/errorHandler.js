export function errorHandler(err, req, res, next) {
  if (req?.log) req.log.error({ err }, 'Unhandled error');
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ message });
}
