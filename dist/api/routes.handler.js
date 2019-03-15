"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const restful = require("node-restful");
restful.mongoose = mongoose;
const log_module_1 = require("../log/log.module");
const model_module_1 = require("../models/model.module");
const patchHandler = require("./patch.handler");
class RoutesHandler {
    constructor(app) {
        this.setCollaboratorId = (req, res, next) => {
            const collaboratorId = req.header('collaboratorId');
            this.collaboratorId = collaboratorId;
            next();
        };
        this._app = app;
        this.models = new model_module_1.Models();
        this.logHandler = new log_module_1.LogHandler(this._app);
    }
    get app() {
        return this._app;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.models.init();
                this.registerRoutes(this.models.routes);
            }
            catch (error) {
                throw error;
            }
        });
    }
    registerRoute(model) {
        const collectionName = model.collectionName;
        const schema = JSON.parse(model.mongooseSchema);
        const strict = model.strict;
        const routeName = model.route;
        const mongooseSchema = new mongoose.Schema(schema, strict);
        const route = (this._app.route[collectionName] = restful
            .model(collectionName, mongooseSchema, collectionName)
            .methods(model.methods)
            .updateOptions(model.updateOptions));
        route.before('post', this.setCollaboratorId);
        route.before('put', this.setCollaboratorId);
        route.before('delete', this.setCollaboratorId);
        route.register(this._app, routeName);
        this.listenOnChanges(collectionName);
        if (model.methods.includes('patch')) {
            const patch = new patchHandler.PatchHandler(this._app, routeName, collectionName);
            patch.registerPatch();
        }
    }
    syncRoutes() {
        return __awaiter(this, void 0, void 0, function* () {
            const syncRoutes = yield this.models.syncRoutes();
            const routesToUnsync = syncRoutes.routesToUnsync;
            const routesToSync = syncRoutes.routesToSync;
            const synchedRoutes = this.synchedRoutes(routesToSync);
            const unsynchedRoutes = this.unsynchedRoutes(routesToUnsync);
            let result = new Object();
            if (synchedRoutes !== '') {
                result['synchedRoutes'] = synchedRoutes;
            }
            if (unsynchedRoutes !== '') {
                result['unsynchedRoutes'] = unsynchedRoutes;
            }
            return result;
        });
    }
    registerRoutes(routes) {
        for (const model of routes) {
            this.registerRoute(model);
        }
    }
    listenOnChanges(collectionName) {
        mongoose
            .model(collectionName)
            .collection.watch()
            .on('change', (data) => __awaiter(this, void 0, void 0, function* () {
            if (data.operationType !== 'update' &&
                data.operationType !== 'delete') {
                return;
            }
            const log = new log_module_1.Log(new mongoose.Types.ObjectId(this.collaboratorId), data.operationType, collectionName, JSON.stringify(data), null, JSON.stringify(data.updateDescription));
            yield this.logHandler.insertOne(log);
        }));
    }
    synchedRoutes(routesToSync) {
        if (routesToSync === undefined ||
            routesToSync === null ||
            routesToSync.length <= 0) {
            return 'All up to date';
        }
        this.registerRoutes(routesToSync);
        return `${routesToSync.map(r => r.collectionName).join()}`;
    }
    unsynchedRoutes(routesToUnsync) {
        if (routesToUnsync === undefined ||
            routesToUnsync === null ||
            routesToUnsync.length <= 0) {
            return 'All up to date';
        }
        for (const unsync of routesToUnsync) {
            this.app._router.stack = this.app._router.stack.filter(r => {
                if (r.route === undefined) {
                    return r;
                }
                return !r.route.path.includes(unsync);
            });
        }
        return `${routesToUnsync.join()}`;
    }
}
exports.RoutesHandler = RoutesHandler;
//# sourceMappingURL=routes.handler.js.map