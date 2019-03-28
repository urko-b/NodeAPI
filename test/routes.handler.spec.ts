import * as chai from 'chai'
import chaiHttp = require('chai-http')
import * as dotenv from 'dotenv'
import 'mocha'
import * as mongoose from 'mongoose'
import * as supertest from 'supertest'

import bodyParser = require('body-parser')
import { RoutesHandler } from '../api/routes.handler'
import * as server from '../app'
import { Route } from '../models/model.module'
import { TestHelper } from './test.module'

let ashTreeId: string
describe('Generic Entity Request (tree entity) Http verbs', () => {
  chai.use(chaiHttp)
  dotenv.config()

  const app: server.App = new server.App(process.env.PORT)
  app.app.use(bodyParser.urlencoded({ extended: true }))
  app.app.use(bodyParser.json({ type: 'application/vnd.api+json' }))
  app.app.use(bodyParser.json({ type: 'application/json-patch' }))
  app.app.use(bodyParser.json())

  it('GET Request: should return OK ', async () => {
    const treeRouteModel: Route = new Route(
      'tree',
      ['get', 'post', 'delete', 'patch'],
      '/tree',
      '{"name": { "type":"String","required": true }}',
      { new: true }
    )

    const routesHandler: RoutesHandler = new RoutesHandler(app.app)
    routesHandler.registerRoute(treeRouteModel)

    const getResult = await chai.request(app.app).get(`/tree`)
    chai.expect(getResult).to.have.status(200)
  })

  it('POST Request: should post ash ', async () => {
    const postResult = await chai
      .request(app.app)
      .post('/tree')
      .set('content-type', 'application/json')
      .send('{ "name": "ash tree" }')

    chai.expect(postResult).to.have.status(201)

    ashTreeId = postResult.body._id
  })

  it('PATCH Request: should patch name field "ash" to "oak"', async () => {
    const patchResult = await chai
      .request(app.app)
      .patch(`/tree/${ashTreeId}`)
      .set('content-type', 'application/json')
      .send('[{"op": "replace", "path": "/name", "value": "oak"}]')

    chai.expect(patchResult).to.have.status(200)
  })

  it('REMOVE Request: should remove patched "ash" tree entity from', async () => {
    const patchResult = await chai.request(app.app).delete(`/tree/${ashTreeId}`)

    chai.expect(patchResult).to.have.status(204)
  })

  it('registerRoutes(): should register and mount phone and smartwatch routes', async () => {
    // Remove each mongoose model because we need to
    //  add each again using RoutesHandler.init function
    TestHelper.removeMongooseModels()

    const phoneRouteModel: Route = new Route(
      'phone',
      ['get', 'post', 'delete', 'patch'],
      '/phone',
      '{"name": { "type":"String","required": true }}',
      { new: true }
    )

    const smartWatchRouteModel: Route = new Route(
      'smartWatch',
      ['get', 'post', 'delete', 'patch'],
      '/smartWatch',
      '{"name": { "type":"String","required": true }}',
      { new: true }
    )

    const routesHandler: RoutesHandler = new RoutesHandler(app.app)
    routesHandler.registerRoutes([phoneRouteModel, smartWatchRouteModel])

    const phoneGetResult = await chai.request(app.app).get(`/phone`)
    const smartWatchGetResult = await chai.request(app.app).get(`/smartWatch`)

    chai.expect(phoneGetResult).to.have.status(200)
    chai.expect(smartWatchGetResult).to.have.status(200)
  })

  it('removeRoutes(): should remove phone endpoint', async () => {
    TestHelper.removeMongooseModels()

    const routesHandler: RoutesHandler = new RoutesHandler(app.app)
    const routesToUnsyc: string[] = ['phone']

    let phoneGetResult = await chai.request(app.app).get(`/phone`)
    if (phoneGetResult.status !== 200) {
      chai.assert(chai.expect(phoneGetResult).to.have.status(200))
    }

    routesHandler.removeRoutes(routesToUnsyc)
    phoneGetResult = await chai.request(app.app).get(`/phone`)

    chai.assert(chai.expect(phoneGetResult).to.have.status(404))
  })
})

describe('Testing RoutesHandler functions:', async () => {
  chai.use(chaiHttp)
  dotenv.config()

  const app: server.App = new server.App(process.env.PORT)
  app.app.use(bodyParser.urlencoded({ extended: true }))
  app.app.use(bodyParser.json({ type: 'application/vnd.api+json' }))
  app.app.use(bodyParser.json({ type: 'application/json-patch' }))
  app.app.use(bodyParser.json())

  it('syncRoutes(): should sync "test_collection"', async () => {
    const routesHandler: RoutesHandler = new RoutesHandler(app.app)
    await routesHandler.init()

    const schemaDoc: any = {
      collection_name: 'test_collection',
      collection_schema: '{"name": "String"}'
    }

    await mongoose.connection.models.collections_schemas.insertMany([schemaDoc])
    const synchedRoutes: any = await routesHandler.syncRoutes()

    await mongoose.connection.models.collections_schemas.findOneAndDelete({
      collection_name: { $eq: 'test_collection' }
    })

    chai.assert(
      chai.expect(synchedRoutes).to.deep.equal({
        synchedRoutes: 'test_collection',
        unsynchedRoutes: 'All up to date'
      })
    )
  })

  it('syncRoutes(): should unsync "test_collection"', async () => {
    // Remove each mongoose model because we need to
    //  add each again using RoutesHandler.init function
    TestHelper.removeMongooseModels()

    const schemaDoc: any = {
      collection_name: 'test_collection',
      collection_schema: '{"name": "String"}'
    }
    const routesHandler: RoutesHandler = new RoutesHandler(app.app)
    await routesHandler.init()

    await mongoose.connection.models.collections_schemas.insertMany([schemaDoc])
    await routesHandler.syncRoutes()

    await mongoose.connection.models.collections_schemas.findOneAndDelete({
      collection_name: { $eq: 'test_collection' }
    })

    const synchedRoutes: any = await routesHandler.syncRoutes()

    chai.assert(
      chai.expect(synchedRoutes).to.deep.equal({
        synchedRoutes: 'All up to date',
        unsynchedRoutes: 'test_collection'
      })
    )
  })

  it('setcollaboratorId(): should set collaboratorId RoutesHandler field from request header "collaboratorId"', async () => {
    TestHelper.removeMongooseModels()

    const routesHandler: RoutesHandler = new RoutesHandler(app.app)
    const collaboratorId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId()

    const req = supertest(app.app)
      .get('/phone')
      .set({ collaboratorId: collaboratorId.toString() })

    routesHandler.setCollaboratorId(req, null, () => {
      return
    })
    chai.assert(
      chai
        .expect(routesHandler.collaboratorId)
        .is.equal(collaboratorId.toString())
    )
  })

  it('synchedRoutes(): should return an array separated by commas with synched routes', async () => {
    TestHelper.removeMongooseModels()

    const routesHandler: RoutesHandler = new RoutesHandler(app.app)

    const routes: string[] = ['syncTestRoute1', 'syncTestRoute2']
    const synchedRoutes = routesHandler.getSynchedRoutes(routes)

    chai.assert(chai.expect(synchedRoutes).is.equals(routes.join()))
  })

  it('unsynchedRoutes(): should return an array separated by commas with unsynched routes', async () => {
    TestHelper.removeMongooseModels()

    const routesHandler: RoutesHandler = new RoutesHandler(app.app)
    const routesToUnsyc: string[] = ['unsyncTestRoute1', 'unsyncTestRoute2']

    const unsynchedRoutes = routesHandler.getUnsynchedRoutes(routesToUnsyc)

    chai.assert(chai.expect(unsynchedRoutes).is.equals(routesToUnsyc.join()))
  })
})
