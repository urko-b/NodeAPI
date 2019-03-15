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
const chai = require("chai");
const chaiHttp = require("chai-http");
const dotenv = require("dotenv");
require("mocha");
const bodyParser = require("body-parser");
const routes_handler_1 = require("../api/routes.handler");
const server = require("../app");
const model_module_1 = require("../models/model.module");
let ashTreeId;
describe('API Generic Entity: Request http verbs', () => {
    chai.use(chaiHttp);
    dotenv.config();
    const app = new server.App(process.env.PORT);
    app.app.use(bodyParser.urlencoded({ extended: true }));
    app.app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
    app.app.use(bodyParser.json({ type: 'application/json-patch' }));
    app.app.use(bodyParser.json());
    it('should return OK Tree Get request', () => __awaiter(this, void 0, void 0, function* () {
        const model = new model_module_1.Route('tree', ['get', 'post', 'delete', 'patch'], '/tree', '{"name": { "type":"String","required": true }}', { new: true });
        const routesHandler = new routes_handler_1.RoutesHandler(app.app);
        routesHandler.registerRoute(model);
        const getResult = yield chai.request(app.app).get(`/tree`);
        chai.expect(getResult).to.have.status(200);
    }));
    it('should post ash tree', () => __awaiter(this, void 0, void 0, function* () {
        const postResult = yield chai
            .request(app.app)
            .post('/tree')
            .set('content-type', 'application/json')
            .send('{ "name": "ash tree" }');
        chai.expect(postResult).to.have.status(201);
        ashTreeId = postResult.body._id;
    }));
    it('should patch name field on ash tree entity', () => __awaiter(this, void 0, void 0, function* () {
        const patchResult = yield chai
            .request(app.app)
            .patch(`/tree/${ashTreeId}`)
            .set('content-type', 'application/json')
            .send('[{"op": "replace", "path": "/name", "value": "oak"}]');
        chai.expect(patchResult).to.have.status(200);
    }));
    it('should remove ash tree from tree entity', () => __awaiter(this, void 0, void 0, function* () {
        const patchResult = yield chai.request(app.app).delete(`/tree/${ashTreeId}`);
        chai.expect(patchResult).to.have.status(204);
    }));
});
//# sourceMappingURL=routes.handler.spec.js.map