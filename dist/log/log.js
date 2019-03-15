"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Log {
    /**
     *
     */
    constructor(collaborator_id, operation, collection_name, payload, old_value, new_value) {
        this.collaborator_id = collaborator_id;
        this.operation = operation;
        this.collection_name = collection_name;
        this.payload = payload;
        this.old_value = old_value;
        this.new_value = new_value;
    }
}
exports.Log = Log;
//# sourceMappingURL=log.js.map