import { Model, model, Schema } from 'mongoose';
import { CollectionSchema } from './collection-schema';
import { SyncSchema } from './sync-schema';

export class SchemaHandler {
  public schemas: CollectionSchema[];
  protected mongooseSchema: Schema;
  protected mongooseModel: Model<any>;

  /**
   * @remarks
   * Constructor, initializes collections array property
   * and call private init function
   */
  constructor() {
    this.schemas = [];
  }

  /**
   * @remarks
   * Initializes mongoose model that represents
   * collections_schemas collection
   */
  public init() {
    this.mongooseSchema = new Schema({
      collection_name: String,
      collection_schema: String
    });

    this.mongooseModel = model(
      process.env.COLLECTIONS_SCHEMAS,
      this.mongooseSchema,
      process.env.COLLECTIONS_SCHEMAS
    );
  }

  /**
   * @remarks
   * Makes a query to collections_schemas collection and
   * fill collections array property with all the documents
   * found
   */
  public fillSchemas = async () => {
    try {
      this.schemas = await this.mongooseModel
        .find({})
        .exec();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * @remarks
   * Check what schemas arent in our array and add them.
   * It also checks what schemas has been deleted
   * from collections_schemas, if there are any
   * it removes from collections array
   *
   * @returns An object of {@link SyncSchema} with collections
   * to add and remove to our collections_schemas array
   */
  public syncSchema = async () => {
    try {
      const syncSchema: SyncSchema = await this.getSchemasToSync();
      this.addSchemas(syncSchema.collectionsToSync);
      this.removeSchemas(syncSchema.collectionsToUnsync);

      return syncSchema;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   *
   * @returns Object of {@link SyncSchema} with the collections to add/remove
   */
  public getSchemasToSync = async (): Promise<SyncSchema> => {
    try {
      const schemas = await this.mongooseModel
        .find({})
        .exec();

      const syncSchema: SyncSchema = new SyncSchema();
      syncSchema.collectionsToSync = schemas.filter(
        this.comparer(this.schemas)
      );

      syncSchema.collectionsToUnsync = this.schemas.filter(
        this.comparer(schemas)
      );

      return syncSchema;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public removeSchemas = (collectionsToUnsync: CollectionSchema[]) => {
    if (collectionsToUnsync.length > 0) {
      for (const unsync of collectionsToUnsync) {
        for (const c of this.schemas) {
          if (unsync[process.env.COLLECTION_NAME] === c[process.env.COLLECTION_NAME]) {
            this.schemas.splice(this.schemas.indexOf(c), 1);
          }
        }
      }
    }
  }

  private addSchemas(collectionsToSync: CollectionSchema[]) {
    if (collectionsToSync.length > 0) {
      this.schemas = this.schemas.concat(collectionsToSync);
    }
  }

  private comparer = (arrayToCompare) => {
    return (current) => {
      return (
        arrayToCompare.filter(other => {
          return other[process.env.COLLECTION_NAME] === current[process.env.COLLECTION_NAME];
        }).length === 0
      );
    };
  }
}
