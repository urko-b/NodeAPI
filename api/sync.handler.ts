import { RoutesHandler } from './routes.handler'

export class SyncHandler {
  protected apiRoute = `/${process.env.WEBAPINAME}/${process.env.VERSION}`
  protected routesHandler: RoutesHandler

  constructor (routesHandler: RoutesHandler) {
    this.routesHandler = routesHandler
  }

  public syncSchemas () {
    this.routesHandler.app.get(`${this.apiRoute}/SyncSchema`, async (req, res, next) => {
      try {
        let schemasSynched = await this.routesHandler.syncRoutes()
        return res.status(200).send(schemasSynched)
      } catch (error) {
        return res.status(400).send(error)
      }
    })
  }

}
