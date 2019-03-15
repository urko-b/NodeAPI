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
class SyncHandler {
    constructor(routesHandler) {
        this.apiRoute = `/${process.env.WEBAPINAME}/${process.env.VERSION}`;
        this.routesHandler = routesHandler;
    }
    /**
     * @api{get}/SyncSchema Sync the api router with the schemas collection
     * @apiVersion 1.0.0
     * @apiPermission Admin
     */
    syncSchemas() {
        this.routesHandler.app.get(`${this.apiRoute}/SyncSchema`, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const schemasSynched = yield this.routesHandler.syncRoutes();
                return res.status(200).send(schemasSynched);
            }
            catch (error) {
                console.error('error', error);
                return res.status(400).send(error);
            }
        }));
    }
}
exports.SyncHandler = SyncHandler;
//# sourceMappingURL=sync.handler.js.map