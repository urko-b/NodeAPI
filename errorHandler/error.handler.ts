
export class ErrorHandler {
    public static handleE11000(error, res, next): void {
        if (error.name === 'MongoError' && error.code === 11000) {
            next(new Error('There was a duplicate key error'));
        } else {
            next();
        }
    };
}