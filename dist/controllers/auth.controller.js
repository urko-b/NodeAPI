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
class AuthController {
    constructor() {
        this.SystemTokens = 'system_tokens';
    }
    init() {
        this.schema = new mongoose.Schema({
            name: String,
            system_token: String
        });
        this.model = mongoose.model(this.SystemTokens, this.schema, this.SystemTokens);
    }
    isTokenValid(token) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model
                .findOne({ system_token: token })
                .exec()
                .then(doc => {
                if (doc === undefined || doc === null) {
                    return false;
                }
                return true;
            })
                .catch(err => {
                console.warn('log error', err);
                throw err;
            });
        });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map