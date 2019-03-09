import * as dotenv from 'dotenv'
import * as mongoose from 'mongoose'
import * as server from './app'

dotenv.config()

mongoose.connect(process.env.DB, connectionError => {
  if (connectionError) {
    return console.error(
      `Error al conectar a la base de datos: ${connectionError}`
    )
  }

  const app = new server.App(process.env.PORT)
  app.init()

  app.Run()
})
