"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Route {
    constructor(collectionName, methods, route, mongooseSchema, updateOptions, strict) {
        this.collectionName = collectionName;
        this.methods = methods;
        this.route = route;
        this.strict = strict;
        this.mongooseSchema = mongooseSchema;
        this.updateOptions = updateOptions;
    }
}
exports.Route = Route;
//# sourceMappingURL=route.js.map