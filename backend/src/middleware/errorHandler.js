function errorHandler(err, req, res, next) {
  const status = Number.isInteger(err.status) ? err.status : 500;
  const message = status >= 500 ? "Ha ocurrido un error, vuelve a intentarlo más tarde" : err.message || "Request failed";

  if (status >= 500) {
    if (process.env.NODE_ENV !== 'test') {
      console.error(err);
    }
  }

  res.status(status).json({ error: message });
}

module.exports = errorHandler;
