import * as chai from 'chai';
import chaiHttp = require('chai-http');
import * as dotenv from 'dotenv';
import 'mocha';
import * as mongoose from 'mongoose';
import * as supertest from 'supertest';

import bodyParser = require('body-parser');
import { RoutesHandler } from '../api/routes.handler';
import * as server from '../app';
import { Route } from '../models/model.module';
import { Routes } from '../models/routes';
import { CollectionSchema } from '../schemas/schema.module';
import { TestHelper } from './test.module';

let ashTreeId: string;
const isDevelopment: boolean = true;

describe('Generic Entity Request (tree entity) Http verbs', () => {
  TestHelper.removeMongooseModels();
  chai.use(chaiHttp);
  dotenv.config();

  const app: server.App = new server.App(process.env.PORT);
  app.app.use(bodyParser.urlencoded({ extended: true }));
  app.app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
  app.app.use(bodyParser.json({ type: 'application/json-patch' }));
  app.app.use(bodyParser.json());

  it('GET Request: should return OK ', async () => {
    const treeRouteModel: Route = new Route(
      'tree',
      ['get', 'post', 'delete', 'patch'],
      '/tree',
      '{"name": { "type":"String","required": true }}',
      { new: true }
    );

    const routesHandler: RoutesHandler = new RoutesHandler(
      app.app,
      isDevelopment
    );
    routesHandler.registerRoute(treeRouteModel);
    const getResult = await chai.request(app.app).get(`/tree`);
    chai.expect(getResult).to.have.status(200);
  });

  it('POST Request: should post ash ', async () => {
    const postResult = await chai
      .request(app.app)
      .post('/tree')
      .set('content-type', 'application/json')
      .send('{ "name": "ash tree" }');

    chai.expect(postResult).to.have.status(201);

    ashTreeId = postResult.body._id;
  });

  it('PATCH Request: should patch name field "ash" to "oak"', async () => {
    const patchResult = await chai
      .request(app.app)
      .patch(`/tree/${ashTreeId}`)
      .set('content-type', 'application/json')
      .send('[{"op": "replace", "path": "/name", "value": "oak"}]');

    chai.expect(patchResult).to.have.status(200);
  });

  it('REMOVE Request: should remove patched "ash" tree entity from', async () => {
    const deleteResult = await chai
      .request(app.app)
      .delete(`/tree/${ashTreeId}`);

    chai.expect(deleteResult).to.have.status(204);
  });

  it('registerRoutes(): should register and mount phone and smartwatch routes', async () => {
    // Remove each mongoose model because we need to
    //  add each again using RoutesHandler.init function
    TestHelper.removeMongooseModels();

    const phoneRouteModel: Route = new Route(
      'phone',
      ['get', 'post', 'delete', 'patch'],
      '/phone',
      '{"name": { "type":"String","required": true }}',
      { new: true }
    );

    const smartWatchRouteModel: Route = new Route(
      'smartWatch',
      ['get', 'post', 'delete', 'patch'],
      '/smartWatch',
      '{"name": { "type":"String","required": true }}',
      { new: true }
    );

    const routesHandler: RoutesHandler = new RoutesHandler(
      app.app,
      isDevelopment
    );

    const routes: Routes = new Routes();
    routes.pushRoute(phoneRouteModel);
    routes.pushRoute(smartWatchRouteModel);

    routesHandler.registerRoutes(routes);

    const phoneGetResult = await chai.request(app.app).get(`/phone`);
    const smartWatchGetResult = await chai.request(app.app).get(`/smartWatch`);

    chai.expect(phoneGetResult).to.have.status(200);
    chai.expect(smartWatchGetResult).to.have.status(200);
  });

  it('removeRoutes(): should remove phone endpoint', async () => {
    TestHelper.removeMongooseModels();

    const routesHandler: RoutesHandler = new RoutesHandler(
      app.app,
      isDevelopment
    );

    const routesToUnsync: string[] = ['phone'];

    let phoneGetResult = await chai.request(app.app).get(`/phone`);
    if (phoneGetResult.status !== 200) {
      chai.assert(chai.expect(phoneGetResult).to.have.status(200));
    }

    routesHandler.removeRoutes(routesToUnsync);
    phoneGetResult = await chai.request(app.app).get(`/phone`);

    chai.assert(chai.expect(phoneGetResult).to.have.status(404));
  });
});

describe('Testing RoutesHandler functions:', async () => {
  chai.use(chaiHttp);
  dotenv.config();

  const app: server.App = new server.App(process.env.PORT);
  app.app.use(bodyParser.urlencoded({ extended: true }));
  app.app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
  app.app.use(bodyParser.json({ type: 'application/json-patch' }));
  app.app.use(bodyParser.json());

  it('init(): should mount api routes for each entity', async () => {
    TestHelper.removeMongooseModels();
    const routesHandler: RoutesHandler = new RoutesHandler(
      app.app,
      isDevelopment
    );
    await routesHandler.init();

    chai.assert(
      chai.expect(mongoose.connection.models.collections_schemas).not.be
        .undefined
    );
  });

  it('syncRoutes(): should sync "test_collection"', async () => {
    TestHelper.removeMongooseModels();
    const routesHandler: RoutesHandler = new RoutesHandler(
      app.app,
      isDevelopment
    );
    await routesHandler.init();

    const schemaDoc: any = {
      collection_name: 'test_collection',
      collection_schema: '{"name": "String"}'
    };

    await mongoose.connection.models.collections_schemas.insertMany([schemaDoc]);
    const syncedRoutes: any = await routesHandler.sync();

    await mongoose.connection.models.collections_schemas.findOneAndDelete({
      collection_name: { $eq: 'test_collection' }
    });

    chai.assert(
      chai.expect(syncedRoutes).to.deep.equal({
        syncedRoutes: 'test_collection',
        unsyncedRoutes: 'All up to date'
      })
    );
  });

  it('syncRoutes(): should unsync "test_collection"', async () => {
    // Remove each mongoose model because we need to
    //  add each again using RoutesHandler.init function
    TestHelper.removeMongooseModels();

    const schemaDoc: any = {
      collection_name: 'test_collection',
      collection_schema: '{"name": "String"}'
    };
    const routesHandler: RoutesHandler = new RoutesHandler(
      app.app,
      isDevelopment
    );
    await routesHandler.init();

    await mongoose.connection.models.collections_schemas.insertMany([schemaDoc]);
    await routesHandler.sync();

    await mongoose.connection.models.collections_schemas.findOneAndDelete({
      collection_name: { $eq: 'test_collection' }
    });

    const syncedRoutes: any = await routesHandler.sync();

    chai.assert(
      chai.expect(syncedRoutes).to.deep.equal({
        syncedRoutes: 'All up to date',
        unsyncedRoutes: 'test_collection'
      })
    );
  });

  it('setcollaboratorId(): should set collaboratorId RoutesHandler field from request header "collaboratorId"', done => {
    TestHelper.removeMongooseModels();

    const routesHandler: RoutesHandler = new RoutesHandler(
      app.app,
      isDevelopment
    );
    const collaboratorId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId();

    const req = supertest(app.app)
      .get('/phone')
      .set({ collaboratorId: collaboratorId.toString() });

    routesHandler.setCollaboratorId(req, null, () => {
      return;
    });
    chai.assert(
      chai
        .expect(routesHandler.getCollaboratorId())
        .is.equal(collaboratorId.toString())
    );

    done();
  });

  it('syncedRoutes(): should return an array separated by commas with synced routes', done => {
    TestHelper.removeMongooseModels();

    const routesHandler: RoutesHandler = new RoutesHandler(
      app.app,
      isDevelopment
    );

    const routes: string[] = ['syncTestRoute1', 'syncTestRoute2'];
    const syncedRoutes = routesHandler.getSyncedRoutes(routes);

    chai.assert(chai.expect(syncedRoutes).is.equals(routes.join()));
    done();
  });

  it('unsyncedRoutes(): should return an array separated by commas with unsynced routes', done => {
    TestHelper.removeMongooseModels();

    const routesHandler: RoutesHandler = new RoutesHandler(
      app.app,
      isDevelopment
    );
    const routesToUnsync: string[] = ['unsyncTestRoute1', 'unsyncTestRoute2'];

    const unsyncedRoutes = routesHandler.getUnsyncedRoutes(routesToUnsync);

    chai.assert(chai.expect(unsyncedRoutes).is.equals(routesToUnsync.join()));
    done();
  });

  it('getRoutesToUnsync(): should return an array of strings with all routes to unsynchronize', done => {
    TestHelper.removeMongooseModels();

    const routesHandler: RoutesHandler = new RoutesHandler(
      app.app,
      isDevelopment
    );
    const routesToUnsync: string[] = ['unsyncTestRoute1', 'unsyncTestRoute2'];

    const unsyncedRoutes = routesHandler.getRoutesToUnsync(routesToUnsync);

    chai.assert(chai.expect(unsyncedRoutes).is.eql(routesToUnsync));
    done();
  });

  it('getRoutesToSync(): should return a string array with all routes to synchronize', done => {
    TestHelper.removeMongooseModels();

    const routesHandler: RoutesHandler = new RoutesHandler(
      app.app,
      isDevelopment
    );
    const result: string[] = ['testRoute1', 'testRoute2'];
    const routesToSync: Routes = new Routes();

    const collection1 = new CollectionSchema('testRoute1');
    const collection2 = new CollectionSchema('testRoute2');
    routesToSync.addRoute(collection1);
    routesToSync.addRoute(collection2);

    const syncedRoutes = routesHandler.getRoutesToSync(routesToSync);
    chai.assert(chai.expect(syncedRoutes).is.eql(result));
    done();
  });
});
