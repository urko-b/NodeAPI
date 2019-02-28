import * as mongoose from 'mongoose'
import * as dotenv from 'dotenv'

dotenv.config()
before((done) => {
  // Called hooks which runs before something.
  mongoose.connect(process.env.DB, connectionError => {
    if (connectionError) {
      return console.warn(
        `Error al conectar a la base de datos: ${connectionError}`
      )
    }
    console.log('Connected!')
    done()
  })
})
