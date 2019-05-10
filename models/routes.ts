import { CollectionSchema } from '../schemas/schema.module';
import { Route } from './route';

export class Routes {
  private routes: Route[];

  protected apiRoute = `/${process.env.WEBAPINAME}/${process.env.VERSION}`;
  protected methods = ['get', 'post', 'put', 'patch', 'delete'];

  /**
   *
   */
  constructor() {
    this.routes = [];
  }

  public getRoutes() {
    return this.routes;
  }

  public hasRoutes = (): boolean => {
    return this.routes.length > 0;
  }

  public pushRoutes(routesToSync: Routes) {
    this.routes = this.routes.concat(routesToSync.routes);
  }

  public pushRoute(route: Route) {
    this.routes.push(route);
  }

  public addRoute(collection: CollectionSchema) {
    const collectionName: string = collection.collection_name;
    const collectionSchema: string = collection.collection_schema;
    this.routes.push(
      new Route(collectionName, this.methods, `${this.apiRoute}/${collectionName}`,
        collectionSchema, { new: true })
    );
  }
}
