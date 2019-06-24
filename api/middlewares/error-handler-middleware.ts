
export class ErrorHandler {
  public static handleError(err, req, res, next) {
    if (res.headersSent) {
      return next(err);
    }
    res.send({ error: err });
  }
}
