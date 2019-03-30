import * as chai from 'chai'
import chaiHttp = require('chai-http')
import * as dotenv from 'dotenv'
import 'mocha'
import * as mongoose from 'mongoose'
import * as supertest from 'supertest'
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
    let insertedBookId: string
    try {
      const bookCollection = 'book'
      const patchHandler = new PatchHandler(
        app.app,
        bookCollection,
        bookCollection
      )
      patchHandler.registerPatch()

      const cleanCodeBook = {
        author: {
          name: 'Robert',
          surname: 'C. Martin'
        },
        description:
          'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees',
        title: 'Clean code'
      }

      const bookSchema: any = { author: {}, description: String, title: String }
      const mongooseSchema = new mongoose.Schema(bookSchema)
      mongoose.model(bookCollection, mongooseSchema, bookCollection)

      const insertedBook = await mongoose.connection.models.book.insertMany([
        cleanCodeBook
      ])
      insertedBookId = insertedBook[0]._id

      supertest(app.app)
        .patch(`/${bookCollection}/${insertedBookId}`)
        .set('content-type', 'application/json')
        .send('[{"op": "replace", "path": "/title", "value": "newTitle"}]')
        .expect(200)
    } finally {
      await mongoose.connection.models.book.findOneAndDelete({
        _id: { $eq: insertedBookId }
      })
    }
  })
})
