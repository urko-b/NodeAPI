import { RoutesHandler } from './routes.handler';

export class SyncHandler {
  protected apiRoute = `/${process.env.WEBAPINAME}/${process.env.VERSION}`;
  protected routesHandler: RoutesHandler;

  constructor(routesHandler: RoutesHandler) {
    this.routesHandler = routesHandler;
  }

  /**
   * @api{get}/setSyncSchemaRoute Sync the api router with the schemas collection
   * @apiVersion 1.0.0
   * @apiPermission Admin
   */
  public setSyncSchemaRoute() {
    this.routesHandler.app.get(
      `${this.apiRoute}/SyncSchema`,
      async (req, res, next) => {
        try {
          const schemasSynced = await this.routesHandler.sync();
          return res.status(200).send(schemasSynced);
        } catch (error) {
          console.error('error', error);
          return res.status(400).send(error);
        }
      }
    );
  }
}
