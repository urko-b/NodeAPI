import * as chai from 'chai';
import 'mocha';
import * as mongoose from 'mongoose';
import { MongooseSchemaMapper } from '../../../schemas/type-mapper/mongoose-schema-mapper';



describe('Testing mongoose-schema-mapper.ts', () => {
  describe('MongooseSchemaMapper', () => {
    describe('map()', () => {
      it('should map json schema and return mongoose schema with "_id", "name" and "roles" as properties', (done) => {
        const jsonSchema = { "_id": "ObjectId", "name": "String", "roles": [{ "type": "ObjectId", "ref": "roles" }] };
        const mongooseSchema = MongooseSchemaMapper.map(jsonSchema);
        chai.assert(
          chai.expect(mongooseSchema.obj)
            .to.have.keys(['_id', 'name', 'roles'])
        );
        done();
      });
    });
  });
});
