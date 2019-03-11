import * as dotenv from 'dotenv'
import * as mongoose from 'mongoose'

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

afterEach(async () => {
  delete mongoose.connection.models.collections_schemas
})

beforeEach(async () => {
  delete mongoose.connection.models.audit_log
})