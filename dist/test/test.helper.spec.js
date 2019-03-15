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
const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config();
before(done => {
    // Called hooks which runs before something.
    console.log('DB' + process.env.DB);
    mongoose.connect(process.env.DB, connectionError => {
        if (connectionError) {
            done();
            return console.warn(`Error while connecting to database: ${connectionError}`);
        }
        console.log('Connected!');
        done();
    });
});
afterEach(() => __awaiter(this, void 0, void 0, function* () {
    delete mongoose.connection.models.collections_schemas;
}));
beforeEach(() => __awaiter(this, void 0, void 0, function* () {
    delete mongoose.connection.models.audit_log;
}));
//# sourceMappingURL=test.helper.spec.js.map