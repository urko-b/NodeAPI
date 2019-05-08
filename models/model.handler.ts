import { CollectionSchema, SchemaHandler } from '../schemas/schema.module';
import { Routes } from './routes';
import { SyncRoutes } from './sync-routes';

export class ModelHandler {

  private routes: Routes;
  protected schemaHandler: SchemaHandler;

  constructor() {
    this.schemaHandler = new SchemaHandler();
    this.routes = new Routes();
  }

  public async init() {
    try {
      this.schemaHandler.init();
      await this.schemaHandler.fillSchemas();
      this.fillModels();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public fillModels(): void {
    this.routes = new Routes();
    for (const collection of this.schemaHandler.schemas) {
      const collectionSchema: CollectionSchema
        = new CollectionSchema(collection.collection_name, collection.collection_schema);

      this.routes.addRoute(collectionSchema);
    }
  }

  public getRoutes(): Routes {
    return this.routes;
  }

  public async syncRoutes(): Promise<SyncRoutes> {
    try {
      const syncSchema = await this.schemaHandler.syncSchema();

      const schemasToSync = syncSchema.collectionsToSync;
      const schemasToUnsync = syncSchema.collectionsToUnsync;

      const syncRoutes: SyncRoutes = new SyncRoutes();

      const routesToSync: Routes = this.getRoutesToSync(schemasToSync);
      if (routesToSync.hasRoutes()) {
        this.routes.pushRoutes(routesToSync);
        syncRoutes.routesToSync = routesToSync;
      }

      if (schemasToUnsync.length > 0) {
        syncRoutes.routesToUnsync = schemasToUnsync.map(s => s.collection_name);
      }

      return syncRoutes;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private getRoutesToSync(schemasToSync: any[]): Routes {
    const routes: Routes = new Routes();
    for (const collection of schemasToSync) {
      const collectionSchema: CollectionSchema
        = new CollectionSchema(collection.collection_name, collection.collection_schema);

      routes.addRoute(collectionSchema);
    }
    return routes;
  }
}
