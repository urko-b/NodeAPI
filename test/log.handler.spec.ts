import * as chai from 'chai'
import 'mocha'
import * as mongoose from 'mongoose'
import * as server from '../app'
import { Log, LogHandler } from '../log/log.module'

describe('Test Log', () => {
  const apiServer = new server.App(process.env.PORT)
  const logHandler = new LogHandler(apiServer.app)
  const collaboratorId: mongoose.Types.ObjectId = mongoose.Types.ObjectId()

  it('should insert new log', async () => {
    const testLog = new Log(collaboratorId, 'MOCHA TEST')
    await logHandler.insertOne(testLog)

    const foundLog = await logHandler.findOne({
      operation: { $eq: 'MOCHA TEST' }
    })
    return chai.assert(
      chai.expect(foundLog).not.to.be.undefined.and.not.to.be.null
    )
  })

  it('should remove created log', async () => {
    const isRemove = await logHandler.findOneAndDelete({
      collaborator_id: { $eq: collaboratorId }
    })

    return chai.assert(chai.expect(isRemove).to.be.true)
  })
})
