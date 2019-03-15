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
require("mocha");
const mongoose = require("mongoose");
const server = require("../app");
const log_module_1 = require("../log/log.module");
describe('Test Log', () => {
    const apiServer = new server.App(process.env.PORT);
    const logHandler = new log_module_1.LogHandler(apiServer.app);
    const collaborator_id = mongoose.Types.ObjectId();
    it('should insert new log', () => __awaiter(this, void 0, void 0, function* () {
        const testLog = new log_module_1.Log(collaborator_id, 'MOCHA TEST');
        yield logHandler.insertOne(testLog);
        const foundLog = yield logHandler.findOne({
            operation: { $eq: 'MOCHA TEST' }
        });
        return chai.assert(chai.expect(foundLog).not.to.be.undefined.and.not.to.be.null);
    }));
    it('should remove created log', () => __awaiter(this, void 0, void 0, function* () {
        const isRemove = yield logHandler.findOneAndDelete({
            collaborator_id: { $eq: collaborator_id }
        });
        return chai.assert(chai.expect(isRemove).to.be.true);
    }));
});
//# sourceMappingURL=log.handler.spec.js.map