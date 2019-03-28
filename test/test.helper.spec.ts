import * as dotenv from 'dotenv'
import * as mongoose from 'mongoose'
import { TestHelper } from './test.module'

dotenv.config()
before(done => {
  // Called hooks which runs before something.
  mongoose.connect(process.env.DB, connectionError => {
    if (connectionError) {
      done()
      return console.warn(
        `Error while connecting to database: ${connectionError}`
      )
    }
    console.log('Connected!')
    done()
  })
})

afterEach(done => {
  TestHelper.removeMongooseModelCollectionsSchemas()
  done()
})

beforeEach(done => {
  TestHelper.removeMongooseModelAuditLog()
  done()
})
