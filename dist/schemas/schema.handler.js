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
const sync_schema_1 = require("./sync.schema");
class SchemaHandler {
    /**
     *
     */
    constructor() {
        this.CollectionsSchemas = 'collections_schemas';
        this.collectionName = 'collection_name';
        this.comparer = otherArray => {
            return current => {
                return (otherArray.filter(other => {
                    return other[this.collectionName] === current[this.collectionName];
                }).length === 0);
            };
        };
        this.removeCollections = (syncSchema) => {
            for (const unsync of syncSchema.schemasToUnsync) {
                for (const c of this.collections) {
                    if (unsync[this.collectionName] === c[this.collectionName]) {
                        this.collections.splice(this.collections.indexOf(c), 1);
                    }
                }
            }
        };
        this.collections = new Array();
        this.init();
    }
    fillSchema() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.model
                .find({})
                .exec()
                .then(doc => {
                this.collections = doc;
            })
                .catch(error => {
                console.error(error);
                throw error;
            });
        });
    }
    syncSchema() {
        return __awaiter(this, void 0, void 0, function* () {
            // Check what schemas arent in our array
            const syncSchema = yield this.getSchemasToSync();
            if (syncSchema.schemasToSync.length > 0) {
                this.collections = this.collections.concat(syncSchema.schemasToSync);
            }
            if (syncSchema.schemasToUnsync.length > 0) {
                this.removeCollections(syncSchema);
            }
            return syncSchema;
        });
    }
    init() {
        this.schema = new mongoose.Schema({
            collection_name: String,
            collection_schema: String
        });
        this.model = mongoose.model(this.CollectionsSchemas, this.schema, this.CollectionsSchemas);
    }
    getSchemasToSync() {
        return this.model
            .find({})
            .exec()
            .then(schemas => {
            const syncSchema = new sync_schema_1.SyncSchema();
            syncSchema.schemasToSync = schemas.filter(this.comparer(this.collections));
            syncSchema.schemasToUnsync = this.collections.filter(this.comparer(schemas));
            return syncSchema;
        })
            .catch(error => {
            throw error;
        });
    }
}
exports.SchemaHandler = SchemaHandler;
//# sourceMappingURL=schema.handler.js.map