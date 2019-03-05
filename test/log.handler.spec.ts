import * as chai from 'chai'
import 'mocha'
import { LogHandler, Log } from '../log/log.handler';
import * as server from '../app'
import * as mongoose from 'mongoose';


describe('Test Log', () => {
    let apiServer = new server.App(process.env.PORT)
    const logHandler = new LogHandler(apiServer.app)
    let logId: mongoose.Types.ObjectId = mongoose.Types.ObjectId()
    
    it('should insert new log', async () => {
        const testLog = new Log(logId, 'MOCHA TEST')
        await logHandler.insertOne(testLog)

        let foundLog = await logHandler.findOne({ 'operation': { '$eq': 'MOCHA TEST' } })
        return chai.assert(
            chai.expect(foundLog).not.to.be.undefined.and.not.to.be.null
        )
    })

    it('should remove created log', async () => {
        let isRemove = await logHandler.findByIdAndDelete(logId)

        return chai.assert(
            chai.expect(isRemove).to.be.true
        )
    })
})
