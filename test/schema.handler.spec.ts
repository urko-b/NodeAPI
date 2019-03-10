import * as chai from 'chai'
import 'mocha'
import { SchemaHandler, SyncSchema } from '../schemas/schema.module'

describe('Schema Handler Fill', () => {
  const handler = new SchemaHandler()
  it('should fill the collections array', async () => {
    await handler.fillSchema()
    chai.assert(
      chai.expect(handler.collections).to.be.an('array').and.not.be.empty
    )
  })

  // it('should add new model and routes', async () => {
  //   await handler.syncSchema()
  //   chai.assert(chai.expect(this.handler.collections.birds).to.be.undefined)
  // })

  // it('should remove model and routes', async () => {
  //   await handler.syncSchema()

  //   chai.assert(chai.expect(this.handler.collections.birds).to.be.undefined)
  // })
})
