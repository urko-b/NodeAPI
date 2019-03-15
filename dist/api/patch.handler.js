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
const jsonpatch = require("fast-json-patch");
const mongoose = require("mongoose");
class PatchHandler {
    constructor(app, routeName, resource) {
        this.app = app;
        this.routeName = routeName;
        this.resource = resource;
    }
    registerPatch() {
        this.app.patch(`${this.routeName}/:id`, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const patches = req.body;
                const id = req.params.id;
                const doc = yield this.app.route[this.resource].findOne({
                    _id: new mongoose.Types.ObjectId(id)
                });
                const errors = jsonpatch.validate(patches, doc);
                if (errors !== undefined) {
                    const responseErrors = this.handleJsonPatchError(errors, res, patches);
                    return res.status(400).send(responseErrors);
                }
                const documentPatched = jsonpatch.applyPatch(doc, patches, true);
                const newDoc = yield this.app.route[this.resource].updateOne({ _id: new mongoose.Types.ObjectId(id) }, { $set: documentPatched.newDocument }, { new: true });
                return res.status(200).send(newDoc);
            }
            catch (err) {
                return res.status(400).send(res.__(err.message));
            }
        }));
    }
    handleJsonPatchError(errors, res, patches) {
        let responseErrors = '';
        if (Array.isArray(errors)) {
            for (let i = 0; i < errors.length; i++) {
                responseErrors += res.__('Errors in') + ` ${res.__(errors[i])} in ${res.__(patches[i])}`;
            }
        }
        else {
            responseErrors =
                `${errors.name}:` +
                    res.__(errors.message) +
                    ` --> ${JSON.stringify(errors.operation)}`;
        }
        return { 'errors': responseErrors };
    }
}
exports.PatchHandler = PatchHandler;
//# sourceMappingURL=patch.handler.js.map