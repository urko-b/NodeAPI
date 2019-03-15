"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ErrorHandler {
    static handleE11000(error, res, next) {
        if (error.name === 'MongoError' && error.code === 11000) {
            next(new Error(res.__('There was a duplicate key error')));
        }
        else {
            next();
        }
    }
    ;
}
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=error.handler.js.map