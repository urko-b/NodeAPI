import { SchemaHandler } from '../schemas/schema.module'
import { Route } from './route'
import { SyncRoutes } from './sync.routes'

export class Models {
  public get routes(): Route[] {
    return this._routes
  }
  protected apiRoute = `/${process.env.WEBAPINAME}/${process.env.VERSION}`
  protected methods = ['get', 'post', 'put', 'patch', 'delete']

  protected schemaHandler: SchemaHandler

  private _routes: Route[]

  constructor() {
    this.schemaHandler = new SchemaHandler()
  }

  public async init() {
    try {
      await this.schemaHandler.fillSchema()
      this.fillModels()
    } catch (error) {
      throw error
    }
  }

  public async syncRoutes(): Promise<SyncRoutes> {
    const syncSchema = await this.schemaHandler.syncSchema()

    const schemasToSync = syncSchema.schemasToSync
    const schemasToUnsync = syncSchema.schemasToUnsync

    const syncRoutes: SyncRoutes = new SyncRoutes()

    if (schemasToSync.length > 0) {
      const routes = new Array<Route>()

      for (const collection of schemasToSync) {
        const collectionName: string = collection.collection_name
        const collectionSchema: string = collection.collection_schema
        routes.push(
          new Route(
            collectionName,
            this.methods,
            `${this.apiRoute}/${collectionName}`,
            collectionSchema,
            { new: true }
          )
        )
      }

      this._routes = this._routes.concat(routes)
      syncRoutes.routesToSync = routes
    }

    if (schemasToUnsync.length > 0) {
      syncRoutes.routesToUnsync = schemasToUnsync.map(s => s.collection_name)
    }

    return syncRoutes
  }

  private fillModels(): void {
    this._routes = new Array<Route>()
    for (const collection of this.schemaHandler.collections) {
      const collection_name: string = collection.collection_name
      const collection_schema: string = collection.collection_schema
      this._routes.push(
        new Route(
          collection_name,
          this.methods,
          `${this.apiRoute}/${collection_name}`,
          collection_schema,
          { new: true }
        )
      )
    }
  }
}
