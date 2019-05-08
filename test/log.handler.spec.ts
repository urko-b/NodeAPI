import * as chai from 'chai';
import 'mocha';
import { connection, Types } from 'mongoose';
import { App } from '../app';
import { Log, LogHandler } from '../log/log.module';

describe('Test Log', () => {
  const apiServer = new App(process.env.PORT);
  const logHandler = new LogHandler(apiServer.app);
  const collaboratorId: Types.ObjectId = Types.ObjectId();

  it('init()', done => {
    logHandler.init();

    chai.assert(
      chai.expect(connection.models.audit_log).not.be.undefined
    );
    done();
  });

  it('findOne(): should insert new log', async () => {
    await logHandler.init();
    const testLog = new Log(collaboratorId, 'MOCHA TEST');
    await logHandler.insertOne(testLog);

    const foundLog = await logHandler.findOne({
      operation: { $eq: 'MOCHA TEST' }
    });

    return chai.assert(
      chai.expect(foundLog).not.to.be.undefined.and.not.to.be.null
    );
  });

  it('findOneAndDelete(): should remove created log', async () => {
    logHandler.init();
    const isRemove = await logHandler.findOneAndDelete({
      collaborator_id: { $eq: collaboratorId }
    });

    return chai.assert(chai.expect(isRemove).to.be.true);
  });
});
