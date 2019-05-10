import * as chai from 'chai';
import 'mocha';
import * as mongoose from 'mongoose';
import { CollectionSchema, SchemaHandler, SyncSchema } from '../../schemas/schema.module';
import { TestHelper } from '../test.helper';

describe('Testing Schema', () => {
  it('init() should create mongoose model "collections_schemas"', done => {
    const handler = new SchemaHandler();
    handler.init();

    chai.assert(
      chai.expect(mongoose.connection.models.collections_schemas).not.be
        .undefined
    );
    done();
  });

  it('fillSchema() should fill the collections array', async () => {
    TestHelper.registerMongooseCollectionSchemas();
    const schemaDoc: CollectionSchema = {
      collection_name: 'test_collection',
      collection_schema: '{"name": "String"}'
    };
    await mongoose.connection.models.collections_schemas.insertMany([schemaDoc]);
    TestHelper.removeMongooseModels();

    const handler = new SchemaHandler();
    handler.init();
    await handler.fillSchemas();

    await mongoose.connection.models.collections_schemas.findOneAndDelete({
      collection_name: { $eq: 'test_collection' }
    });

    chai.assert(
      chai.expect(handler.schemas).to.be.an('array').and.not.be.empty
    );
  });

  it('syncSchema(): should add birds as new model', async () => {
    const handler = new SchemaHandler();
    handler.init();
    const birdsSchema: object = {
      collection_name: 'birds',
      collection_schema: '{"name": { "type":"String","required": true }}'
    };

    await mongoose.connection.models.collections_schemas.insertMany([
      birdsSchema
    ]);
    await handler.syncSchema();
    chai.assert(
      chai.expect(
        handler.schemas.filter(c => c.collection_name === 'birds')
      ).not.to.be.empty
    );
  });

  it('syncSchema(): should remove birds model', async () => {
    const handler = new SchemaHandler();
    handler.init();
    await mongoose.connection.models.collections_schemas
      .findOneAndRemove({
        collection_name: { $eq: 'birds' }
      })
      .exec();

    await handler.syncSchema();

    chai.assert(
      chai.expect(
        handler.schemas.filter(c => c.collection_name === 'birds')
      ).to.be.empty
    );
  });

  it('getSchemasToSync(): should return an array with the collection we have just inserted to collections_schemas collection', async () => {
    const handler = new SchemaHandler();
    handler.init();
    await handler.fillSchemas();

    const schemaDoc: any = {
      collection_name: 'test_collection',
      collection_schema: '{"name": "String"}'
    };

    await mongoose.connection.models.collections_schemas.insertMany([schemaDoc]);
    const syncSchema: SyncSchema = await handler.getSchemasToSync();

    await mongoose.connection.models.collections_schemas.findOneAndDelete({
      collection_name: { $eq: 'test_collection' }
    });


    chai.assert(
      chai.expect(
        syncSchema.collectionsToSync.filter(
          c => c.collection_name === 'test_collection'
        )
      ).not.to.be.empty
    );
  });

  it('removeCollections(): should unsync(remove) tree from collections array', async () => {
    const handler = new SchemaHandler();
    handler.init();
    handler.schemas = [
      { collection_name: 'tree' },
      { collection_name: 'crag' }
    ];
    const syncSchema: SyncSchema = new SyncSchema();
    syncSchema.collectionsToUnsync = [{ collection_name: 'tree' }];
    await handler.removeSchemas(syncSchema.collectionsToUnsync);

    chai.assert(
      chai
        .expect(handler.schemas.filter(c => c.collection_name === 'tree'))
        .to.be.an('array').and.be.empty
    );
  });


  it('addSchemas(): should add new CollectionSchema to SchemaHandler schemas array', (done) => {
    const handler = new SchemaHandler();
    handler.init();

    const collectionsToSync: CollectionSchema[] = [];
    collectionsToSync.push(new CollectionSchema('testCollection', '{"name": "String"}'));

    handler.addSchemas(collectionsToSync);

    chai.assert(chai.expect(handler.schemas).to.have.length(1));
    done();
  });

  it('comparer(): should compare two arrays and return differences (in this case 1 element)', (done) => {
    const handler = new SchemaHandler();

    const schemas: CollectionSchema[] = [];
    schemas.push(new CollectionSchema('testCollection', '{"name": "String"}'));
    schemas.push(new CollectionSchema('testCollection2', '{"name": "String"}'));

    const schemasComparer: CollectionSchema[] = [];
    schemasComparer.push(new CollectionSchema('testCollection', '{"name": "String"}'));

    const schemasComparerResult = schemas.filter(handler.comparer(schemasComparer));
    chai.assert(chai.expect(schemasComparerResult).to.have.length(1));
    done();
  });
});

