import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import { TestHelper } from './test.module';

dotenv.config();
before(done => {
  mongoose.connect(process.env.MONGO_URL_TEST, { useFindAndModify: false, useNewUrlParser: true }, connectionError => {
    if (connectionError) {
      done();
      return console.warn(
        `Error while connecting to database: ${connectionError}`
      );
    }
    console.log(`Connected! ${process.env.MONGO_URL_TEST}`);
    done();
  });
});

afterEach(done => {
  TestHelper.removeMongooseModelCollectionsSchemas();
  done();
});

beforeEach(done => {
  TestHelper.removeMongooseModelAuditLog();
  done();
});
