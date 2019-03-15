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
const schema_module_1 = require("../schemas/schema.module");
describe('Schema Handler Fill', () => {
    it('should fill the collections array', () => __awaiter(this, void 0, void 0, function* () {
        const handler = new schema_module_1.SchemaHandler();
        yield handler.fillSchema();
        chai.assert(chai.expect(handler.collections).to.be.an('array').and.not.be.empty);
    }));
    it('should add birds as new model', () => __awaiter(this, void 0, void 0, function* () {
        const handler = new schema_module_1.SchemaHandler();
        const birdsSchema = {
            collection_name: 'birds',
            collection_schema: '{"name": { "type":"String","required": true }}'
        };
        console.log('DB' + process.env.DB);
        yield mongoose.connection.models.collections_schemas.insertMany([
            birdsSchema
        ]);
        yield handler.syncSchema();
        chai.assert(chai.expect(handler.collections.filter(c => c.collection_name === 'birds')).not.to.be.empty);
    }));
    it('should remove birds model', () => __awaiter(this, void 0, void 0, function* () {
        const handler = new schema_module_1.SchemaHandler();
        yield mongoose.connection.models.collections_schemas
            .findOneAndRemove({
            collection_name: { $eq: 'birds' }
        })
            .exec();
        yield handler.syncSchema();
        chai.assert(chai.expect(handler.collections.filter(c => c.collection_name === 'bird'))
            .to.be.empty);
    }));
});
//# sourceMappingURL=schema.handler.spec.js.map