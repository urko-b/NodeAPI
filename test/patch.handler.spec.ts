import * as chai from 'chai'
import chaiHttp = require('chai-http')
import * as dotenv from 'dotenv'
import 'mocha'
import * as mongoose from 'mongoose'
import { PatchHandler } from '../api/patch.handler'
import * as server from '../app'

import bodyParser = require('body-parser')

const ashTreeId: string = '5c861457ec435215e003f82a'
describe('Testing patch.handler', () => {
  chai.use(chaiHttp)
  dotenv.config()

  const app: server.App = new server.App(process.env.PORT)
  app.app.use(bodyParser.urlencoded({ extended: true }))
  app.app.use(bodyParser.json({ type: 'application/vnd.api+json' }))
  app.app.use(bodyParser.json({ type: 'application/json-patch' }))
  app.app.use(bodyParser.json())
  it('registerPatch(): ', async () => {
    const patchHandler = new PatchHandler(app.app, 'book', 'book')

    patchHandler.registerPatch()

    const getResult = await chai.request(app.app).get(`/book`)
    console.log('getResult.body', getResult.body)
    const patchResult = await chai
      .request(app.app)
      .patch(`/book/${ashTreeId}`)
      .set('content-type', 'application/json')
      .send('[{"op": "replace", "path": "/title", "value": "newTitle"}]')

    chai.expect(patchResult).to.have.status(200)
  })
})
