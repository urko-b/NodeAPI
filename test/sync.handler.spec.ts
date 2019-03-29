import * as chai from 'chai'
import chaiHttp = require('chai-http')
import * as dotenv from 'dotenv'
import 'mocha'
import * as mongoose from 'mongoose'
import { RoutesHandler } from '../api/routes.handler'
import { SyncHandler } from '../api/sync.handler'
import * as server from '../app'

import bodyParser = require('body-parser')

describe('Testing sync.handler', () => {
  chai.use(chaiHttp)
  dotenv.config()

  const app: server.App = new server.App(process.env.PORT)
  app.app.use(bodyParser.urlencoded({ extended: true }))
  app.app.use(bodyParser.json({ type: 'application/vnd.api+json' }))
  app.app.use(bodyParser.json({ type: 'application/json-patch' }))
  app.app.use(bodyParser.json())

  it('synchSchemas(): should return 200 after get request to SyncSchema endpoint', async() => {
    const routesHandler = new RoutesHandler(app.app)
    const syncHandler = new SyncHandler(routesHandler)
    syncHandler.syncSchemas()

    const apiRoute = `/${process.env.WEBAPINAME}/${process.env.VERSION}`

    const syncSchemaResult = await chai
      .request(app.app)
      .get(`${apiRoute}/SyncSchema`)
      
    chai.assert(chai.expect(syncSchemaResult).to.have.status(200))
  })
})
