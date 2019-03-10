import { RoutesHandler } from './routes.handler'

export class SyncHandler {
  protected apiRoute = `/${process.env.WEBAPINAME}/${process.env.VERSION}`
  protected routesHandler: RoutesHandler

  constructor(routesHandler: RoutesHandler) {
    this.routesHandler = routesHandler
  }

  /**
   * @api{get}/SyncSchema Sync the api router with the schemas collection
   * @apiVersion 1.0.0
   * @apiPermission Admin
   */
  public syncSchemas() {
    this.routesHandler.app.get(
      `${this.apiRoute}/SyncSchema`,
      async (req, res, next) => {
        try {
          const schemasSynched = await this.routesHandler.syncRoutes()
          return res.status(200).send(schemasSynched)
        } catch (error) {
          console.error('error', error)
          return res.status(400).send(error)
        }
      }
    )
  }
}
