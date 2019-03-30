import * as chai from 'chai'
import chaiHttp = require('chai-http')
import 'mocha'
import * as mongoose from 'mongoose'
import { ModelsHandler, SyncRoutes } from '../models/model.module'

import * as dotenv from 'dotenv'
import * as server from '../app'

import bodyParser = require('body-parser')
import { TestHelper } from './test.helper'

describe('Testing models.handler', () => {
  chai.use(chaiHttp)
  dotenv.config()

  const app: server.App = new server.App(process.env.PORT)
  app.app.use(bodyParser.urlencoded({ extended: true }))
  app.app.use(bodyParser.json({ type: 'application/vnd.api+json' }))
  app.app.use(bodyParser.json({ type: 'application/json-patch' }))
  app.app.use(bodyParser.json())

  TestHelper.removeMongooseModels()

  it('init(): Should fill modelsHandler routes field', async () => {
    const modelsHandler = new ModelsHandler()
    await modelsHandler.init()

    chai.assert(
      chai
        .expect(modelsHandler.routes)
        .to.be.an('array')
        .not.be.empty.and.have.deep.property('collection_name')
    )
  })

  it('syncRoutes(): Testing routes to "sync"', async () => {
    const modelsHandler = new ModelsHandler()
    modelsHandler.init()
    let syncRoutes: SyncRoutes

    const schemaDoc: any = {
      collection_name: 'test_collection',
      collection_schema: '{"name": "String"}'
    }
    await modelsHandler.syncRoutes()

    await mongoose.connection.models.collections_schemas.insertMany([schemaDoc])

    syncRoutes = await modelsHandler.syncRoutes()

    const routesToSync = syncRoutes.routesToSync
    chai.assert(
      chai
        .expect(routesToSync)
        .to.be.an('array')
        .not.be.empty.and.have.deep.property(
          'collection_name',
          'test_collection'
        )
    )
  })

  it('syncRoutes(): Testing routes to "unsync"', async () => {
    const modelsHandler = new ModelsHandler()
    await modelsHandler.init()
    await mongoose.connection.models.collections_schemas.findOneAndDelete({
      collection_name: { $eq: 'test_collection' }
    })

    const syncRoutes: SyncRoutes = await modelsHandler.syncRoutes()

    const routesToUnsync = syncRoutes.routesToUnsync

    chai.assert(
      chai
        .expect(routesToUnsync)
        .to.be.an('array')
        .not.be.empty.and.equals(['test_collection'])
    )
  })

  it('fillModels(): Testing fillModels()', async () => {
    const modelsHandler = new ModelsHandler()
    await modelsHandler.init()
    modelsHandler.fillModels()
    chai.assert(
      chai.expect(modelsHandler.routes).to.be.an('array').not.be.empty
    )
  })
})
