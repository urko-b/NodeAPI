import { SchemaHandler } from '../schemas/schema.handler'

export class Route {
  public collectionName: string
  public methods: Array<string>
  public route: string
  public strict: Object
  public mongooseSchema: string
  public updateOptions: Object

  constructor (collectionName: string, methods: Array<string>, route: string, mongooseSchema: string, updateOptions?: Object, strict?: Object) {
    this.collectionName = collectionName
    this.methods = methods
    this.route = route
    this.strict = strict
    this.mongooseSchema = mongooseSchema
    this.updateOptions = updateOptions
  }
}

export class SyncRoutes {
  public routesToSync: Array<any>
  public routesToUnsync: Array<any>
}

export class Models {
  protected apiRoute = `/${process.env.WEBAPINAME}/${process.env.VERSION}`
  protected methods = ['get', 'post', 'put', 'patch', 'delete']

  protected schemaHandler: SchemaHandler.Handler

  private _routes: Array<Route>
  public get routes (): Array<Route> {
    return this._routes
  }

  constructor () {
    this.schemaHandler = new SchemaHandler.Handler()
  }

  public async Init () {
    try {
      await this.schemaHandler.fillSchema()
      this.initModelsArray()
    } catch (error) {
      throw error
    }
  }

  private initModelsArray (): void {

    this._routes = new Array<Route>()
    for (let collection of this.schemaHandler.collections) {
      let collection_name: string = collection.collection_name
      let collection_schema: string = collection.collection_schema
      this._routes.push(new Route(collection_name, this.methods, `${this.apiRoute}/${collection_name}`, collection_schema, { new: true }))
    }
  }

  public async syncRoutes (): Promise<SyncRoutes> {
    let syncSchema = await this.schemaHandler.syncSchema()

    let schemasToSync = syncSchema.schemasToSync
    let schemasToUnsync = syncSchema.schemasToUnsync

    let syncRoutes: SyncRoutes = new SyncRoutes()

    if (schemasToSync.length > 0) {
      let routes = new Array<Route>()

      for (let collection of schemasToSync) {
        let collectionName: string = collection.collection_name
        let collectionSchema: string = collection.collection_schema
        routes.push(new Route(collectionName, this.methods, `${this.apiRoute}/${collectionName}`, collectionSchema, { new: true }))
      }

      this._routes = this._routes.concat(routes)
      syncRoutes.routesToSync = routes
    }

    if (schemasToUnsync.length > 0) {
      syncRoutes.routesToUnsync = schemasToUnsync.map(s => s.collection_name)
    }

    return syncRoutes
  }
}
