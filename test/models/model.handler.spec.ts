import * as chai from 'chai';
import chaiHttp = require('chai-http');
import 'mocha';
import * as mongoose from 'mongoose';
import { ModelHandler, Routes, SyncRoutes } from '../../models/model.module';

import * as dotenv from 'dotenv';
import * as server from '../../app';

import bodyParser = require('body-parser');
import { CollectionSchema } from '../../schemas/schema.module';
import { TestHelper } from '../test.helper';

describe('Testing models.handler', () => {
  chai.use(chaiHttp);
  dotenv.config();

  const app: server.App = new server.App(process.env.PORT);
  app.app.use(bodyParser.urlencoded({ extended: true }));
  app.app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
  app.app.use(bodyParser.json({ type: 'application/json-patch' }));
  app.app.use(bodyParser.json());

  TestHelper.removeMongooseModels();

  it('init(): Should fill modelsHandler routes field', async () => {
    const modelsHandler = new ModelHandler();
    await modelsHandler.init();

    chai.assert(
      chai
        .expect(modelsHandler.getRoutes().getRoutes())
        .to.be.an('array')
        .not.be.empty.and.have.deep.property('collection_name')
    );
  });

  it('syncRoutes(): Testing routes to "sync"', async () => {
    const modelsHandler = new ModelHandler();
    modelsHandler.init();
    let syncRoutes: SyncRoutes;

    const schemaDoc: any = {
      collection_name: 'test_collection',
      collection_schema: '{"name": "String"}'
    };
    await modelsHandler.syncRoutes();

    await mongoose.connection.models.collections_schemas.insertMany([schemaDoc]);

    syncRoutes = await modelsHandler.syncRoutes();

    const routesToSync = syncRoutes.routesToSync;
    chai.assert(
      chai
        .expect(routesToSync.getRoutes())
        .to.be.an('array')
        .not.be.empty.and.have.deep.property(
          'collection_name',
          'test_collection'
        )
    );
  });

  it('syncRoutes(): Testing routes to "unsync"', async () => {
    const modelsHandler = new ModelHandler();
    await modelsHandler.init();
    await mongoose.connection.models.collections_schemas.findOneAndDelete({
      collection_name: { $eq: 'test_collection' }
    });

    const syncRoutes: SyncRoutes = await modelsHandler.syncRoutes();

    const routesToUnsync = syncRoutes.routesToUnsync;

    chai.assert(
      chai
        .expect(routesToUnsync)
        .to.be.an('array')
        .not.be.empty.and.equals(['test_collection'])
    );
  });

  it('fillModels(): Testing fillModels()', async () => {
    const modelsHandler = new ModelHandler();
    await modelsHandler.init();
    modelsHandler.fillModels();
    chai.assert(
      chai.expect(modelsHandler.getRoutes().getRoutes()).to.be.an('array').not.be.empty
    );
  });

  it('getRoutesToSync(): ', (done) => {
    const modelsHandler = new ModelHandler();
    const collectionName: string = 'SyncTestCollection';
    const collectionSchema: string = '{"name": "String"}';

    const routes: Routes = new Routes();
    routes.addRoute(new CollectionSchema(collectionName, collectionSchema));

    const collectionsToSync = [
      { 'collection_name': collectionName, 'collection_schema': collectionSchema }
    ];
    const routesToSync = modelsHandler.getRoutesToSync(collectionsToSync);

    chai.assert(chai.expect(routesToSync.getRoutes()).to.deep.equals(routes.getRoutes()));
    done();
  });
});