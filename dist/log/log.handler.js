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
class LogHandler {
    /**
     *
     */
    constructor(app) {
        this.AuditLog = 'audit_log';
        this.app = app;
        this.init();
    }
    /**
     * insert log
     */
    insertOne(log) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.model.insertMany([log]).catch(err => {
                console.warn('log error', err);
                throw err;
            });
        });
    }
    findOne(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model
                .findOne(filter)
                .exec()
                .then(doc => {
                return doc;
            })
                .catch(err => {
                console.warn('log error', err);
                throw err;
            });
        });
    }
    findOneAndDelete(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model
                .findOneAndDelete(filter)
                .exec()
                .then(doc => {
                if (doc === undefined && doc === null) {
                    console.warn('log error');
                    throw new Error('Error while remove log');
                }
                return true;
            })
                .catch(err => {
                console.warn('exception log error', err);
                throw err;
            });
        });
    }
    init() {
        this.schema = new mongoose.Schema({
            collaborator_id: mongoose.Types.ObjectId,
            date: {
                type: Date,
                default: Date.now()
            },
            operation: String,
            collection_name: String,
            payload: String,
            old_value: String,
            new_value: String
        });
        this.model = mongoose.model(this.AuditLog, this.schema, this.AuditLog);
    }
}
exports.LogHandler = LogHandler;
//# sourceMappingURL=log.handler.js.map