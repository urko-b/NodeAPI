import * as mongoose from 'mongoose'
import { SyncSchema } from './sync.schema'

export class SchemaHandler {
  public collections: any[]
  protected schema: mongoose.Schema
  protected model: mongoose.Model<any>
  protected readonly CollectionsSchemas: string = 'collections_schemas'
  protected readonly collectionName: string = 'collection_name'

  /**
   * @remarks
   * Constructor, initializes collections array property
   * and call private init function
   */
  constructor() {
    this.collections = new Array<any>()
  }

  /**
   * @remarks
   * Makes a query to collections_schemas collection and
   * fill collections array property with all the documents
   * founded
   *
   */
  public fillSchema = async () => {
    await this.model
      .find({})
      .exec()
      .then(doc => {
        this.collections = doc
      })
      .catch(error => {
        console.error(error)
        throw error
      })
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
    const syncSchema: SyncSchema = await this.getSchemasToSync()
    if (syncSchema.schemasToSync.length > 0) {
      this.collections = this.collections.concat(syncSchema.schemasToSync)
    }

    if (syncSchema.schemasToUnsync.length > 0) {
      this.removeCollections(syncSchema)
    }

    return syncSchema
  }

  /**
   *
   */
  public removeCollections = (syncSchema: SyncSchema) => {
    for (const unsync of syncSchema.schemasToUnsync) {
      for (const c of this.collections) {
        if (unsync[this.collectionName] === c[this.collectionName]) {
          this.collections.splice(this.collections.indexOf(c), 1)
        }
      }
    }
  }

  /**
   *
   * @returns Object of {@link SyncSchema} with the collections to add/remove
   */
  public getSchemasToSync = async () => {
    return this.model
      .find({})
      .exec()
      .then(schemas => {
        const syncSchema: SyncSchema = new SyncSchema()
        syncSchema.schemasToSync = schemas.filter(
          this.comparer(this.collections)
        )
        syncSchema.schemasToUnsync = this.collections.filter(
          this.comparer(schemas)
        )
        return syncSchema
      })
      .catch(error => {
        throw error
      })
  }

  /**
   * @remarks
   * Initializes mongoose model that represents
   * collections_schemas collection
   */
  public init() {
    this.schema = new mongoose.Schema({
      collection_name: String,
      collection_schema: String
    })

    this.model = mongoose.model(
      this.CollectionsSchemas,
      this.schema,
      this.CollectionsSchemas
    )
  }

  /**
   *
   */
  private comparer = otherArray => {
    return current => {
      return (
        otherArray.filter(other => {
          return other[this.collectionName] === current[this.collectionName]
        }).length === 0
      )
    }
  }
}
