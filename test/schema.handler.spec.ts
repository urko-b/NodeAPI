import * as chai from 'chai'
import 'mocha'
import { SchemaHandler } from '../schemas/schema.handler'

describe('Schema Handler Fill', () => {
  it('should fill the collections array', async () => {
    const handler = new SchemaHandler.Handler()
    await handler.fillSchema()
    return chai.assert(
      chai.expect(handler.collections).to.be.an('array').and.not.be.empty
    )
  })
})
