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
  protected schemaHandler: SchemaHandler.Handler

  private _routes: Array<any>
  public get routes (): Array<any> {
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
    const apiRoute = `/${process.env.WEBAPINAME}/${process.env.VERSION}`
    let methods = ['get', 'post', 'put', 'patch', 'delete']

    this._routes = new Array<Route>()
    for (let collection of this.schemaHandler.collections) {
      let collection_name: string = collection.collection_name
      let collection_schema: string = collection.collection_schema
      this._routes.push(new Route(collection_name, methods, `${apiRoute}/${collection_name}`, collection_schema, { new: true }))
    }
  }
}
