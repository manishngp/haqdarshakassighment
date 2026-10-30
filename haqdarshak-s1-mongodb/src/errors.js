export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
export function errorHandler(err, req, res, next) {
  const status = err.status || (err.name === "CastError" ? 400 : 500);
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status === 500 ? "Internal server error" : err.message });
}
