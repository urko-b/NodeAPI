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
const schema_module_1 = require("../schemas/schema.module");
const route_1 = require("./route");
const sync_routes_1 = require("./sync.routes");
class Models {
    constructor() {
        this.apiRoute = `/${process.env.WEBAPINAME}/${process.env.VERSION}`;
        this.methods = ['get', 'post', 'put', 'patch', 'delete'];
        this.schemaHandler = new schema_module_1.SchemaHandler();
    }
    get routes() {
        return this._routes;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.schemaHandler.fillSchema();
                this.fillModels();
            }
            catch (error) {
                throw error;
            }
        });
    }
    syncRoutes() {
        return __awaiter(this, void 0, void 0, function* () {
            const syncSchema = yield this.schemaHandler.syncSchema();
            const schemasToSync = syncSchema.schemasToSync;
            const schemasToUnsync = syncSchema.schemasToUnsync;
            const syncRoutes = new sync_routes_1.SyncRoutes();
            if (schemasToSync.length > 0) {
                const routes = new Array();
                for (const collection of schemasToSync) {
                    const collectionName = collection.collection_name;
                    const collectionSchema = collection.collection_schema;
                    routes.push(new route_1.Route(collectionName, this.methods, `${this.apiRoute}/${collectionName}`, collectionSchema, { new: true }));
                }
                this._routes = this._routes.concat(routes);
                syncRoutes.routesToSync = routes;
            }
            if (schemasToUnsync.length > 0) {
                syncRoutes.routesToUnsync = schemasToUnsync.map(s => s.collection_name);
            }
            return syncRoutes;
        });
    }
    fillModels() {
        this._routes = new Array();
        for (const collection of this.schemaHandler.collections) {
            const collection_name = collection.collection_name;
            const collection_schema = collection.collection_schema;
            this._routes.push(new route_1.Route(collection_name, this.methods, `${this.apiRoute}/${collection_name}`, collection_schema, { new: true }));
        }
    }
}
exports.Models = Models;
//# sourceMappingURL=model.handler.js.map