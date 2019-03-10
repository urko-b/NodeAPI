import * as chai from 'chai'
import 'mocha'
import * as mongoose from 'mongoose'
import { SchemaHandler } from '../schemas/schema.module'

describe('Schema Handler Fill', () => {
  it('should fill the collections array', async () => {
    const handler = new SchemaHandler()
    await handler.fillSchema()
    chai.assert(
      chai.expect(handler.collections).to.be.an('array').and.not.be.empty
    )
  })

  it('should add birds as new model', async () => {
    const handler = new SchemaHandler()
    const birdsSchema: object = {
      collection_name: 'birds',
      collection_schema: '{"name": { "type":"String","required": true }}'
    }

    await mongoose.connection.models.collections_schemas.insertMany([
      birdsSchema
    ])
    await handler.syncSchema()
    chai.assert(
      chai.expect(
        handler.collections.filter(c => c.collection_name === 'birds')
      ).not.to.be.empty
    )
  })

  it('should remove birds model', async () => {
    const handler = new SchemaHandler()
    await mongoose.connection.models.collections_schemas
      .findOneAndRemove({
        collection_name: { $eq: 'birds' }
      })
      .exec()

    await handler.syncSchema()

    chai.assert(
      chai.expect(handler.collections.filter(c => c.collection_name === 'bird'))
        .to.be.empty
    )
  })
})
