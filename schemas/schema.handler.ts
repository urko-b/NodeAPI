import * as mongoose from 'mongoose';

export namespace SchemaHandler {
    export class CollectionSchema {
        public collection_name: string;
        public collection_schema: string;
    }


    export class Handler {

        public collections: any;
        protected schema: mongoose.Schema;

        /**
         *
         */
        constructor() {
            this.collections = new Array<CollectionSchema>();
        }

        public async fillSchema() {
            this.schema = new mongoose.Schema({
                'collection_name': String,
                'collection_schema': String
            });

            let model: mongoose.Model<any> = mongoose.model('CollectionSchemas', this.schema, 'CollectionSchemas');

            await model.find({}).exec()
                .then(doc => {
                    this.collections = doc;
                }).catch((error) => {
                    throw error;
                });
        }
    }
}
