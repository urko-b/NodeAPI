import { SchemaHandler } from '../schemas/schema.handler'

export class Route {
  public model: string
  public methods: Array<string>
  public route: string
  public strict: Object
  public mongooseSchema: string
  public updateOptions: Object

  constructor (model: string, methods: Array<string>, route: string, mongooseSchema: string, updateOptions?: Object, strict?: Object) {
    this.model = model
    this.methods = methods
    this.route = route
    this.strict = strict
    this.mongooseSchema = mongooseSchema
    this.updateOptions = updateOptions
  }
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

  public async syncSchema () {
    let schemasToSync = await this.schemaHandler.syncSchemas()

    if (schemasToSync.length <= 0) {
      return []
    }
    let routes = new Array<Route>()

    for (let collection of schemasToSync) {
      let collectionName: string = collection.collection_name
      let collectionSchema: string = collection.collection_schema
      routes.push(new Route(collectionName, this.methods, `${this.apiRoute}/${collectionName}`, collectionSchema, { new: true }))
    }

    this._routes = this._routes.concat(routes)

    return routes
  }
}
