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
const bodyParser = require("body-parser");
const express = require("express");
const i18n = require("i18n");
const methodOverride = require("method-override");
const morgan = require("morgan");
const routes_handler_1 = require("./api/routes.handler");
const sync_handler_1 = require("./api/sync.handler");
const auth_controller_1 = require("./controllers/auth.controller");
class App {
    constructor(port) {
        this.Run = () => {
            this.app.listen(this.port, () => {
                console.info(`API REST running in http://localhost:${this.port}`);
            });
        };
        this.tokenMiddleware = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const secret = req.header('token');
            if (secret === undefined) {
                res.status(401);
                next('Unauthorized');
            }
            const isTokenValid = yield this.authController.isTokenValid(secret);
            if (isTokenValid === false) {
                res.status(401);
                next('The token provided is not valid');
            }
            next();
        });
        this.port = port;
        this.app = express();
    }
    init() {
        this.routesHandler = new routes_handler_1.RoutesHandler(this.app);
        this.syncHandler = new sync_handler_1.SyncHandler(this.routesHandler);
        this.authController = new auth_controller_1.AuthController();
        this.authController.init();
        this.initi18n();
        this.useMiddlewares();
        this.mountRoutes().catch(err => {
            console.warn(err);
        });
        this.syncHandler.syncSchemas();
    }
    initi18n() {
        i18n.configure({
            locales: ['en', 'es', 'fr', 'es', 'pt', 'de'],
            cookie: 'language-cookie',
            directory: __dirname + '/locales'
        });
    }
    useMiddlewares() {
        this.app.use(morgan('dev'));
        this.useBodyParser();
        this.app.use(methodOverride());
        this.app.use(this.tokenMiddleware);
        this.app.use(i18n.init);
        this.app.use(this.i18nSetLocaleMiddleware);
    }
    useBodyParser() {
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
        this.app.use(bodyParser.json({ type: 'application/json-patch' }));
        this.app.use(bodyParser.json());
    }
    i18nSetLocaleMiddleware(req, res, next) {
        if (req.cookies !== undefined &&
            req.cookies['language-cookie'] !== undefined) {
            res.setLocale(req.cookies['language-cookie']);
        }
        next();
    }
    mountRoutes() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.routesHandler.init();
            }
            catch (error) {
                console.error('Unexpected error occurred in mountRoutes()', error);
            }
        });
    }
}
exports.App = App;
//# sourceMappingURL=app.js.map