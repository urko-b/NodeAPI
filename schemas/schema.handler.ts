import * as mongoose from 'mongoose'
import { compare } from 'fast-json-patch'

export namespace SchemaHandler {
  export class SyncSchema {
    public schemasToSync: Array<any>
    public schemasToUnsync: Array<any>
  }

  export class Handler {
    public collections: Array<any>
    protected schema: mongoose.Schema
    protected model: mongoose.Model<any>
    protected readonly CollectionsSchemas: string = 'collections_schemas'
    protected readonly collectionName: string = 'collection_name'

    /**
     *
     */
    constructor () {
      this.collections = new Array<any>()
      this.init()
    }

    private init () {
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

    public async fillSchema () {
      await this.model
        .find({})
        .exec()
        .then(doc => {
          this.collections = doc
        })
        .catch(error => {
          throw error
        })
    }

    public async syncSchema () {
      // Check what schemas arent in our array
      let syncSchema: SyncSchema = await this.getSchemasToSync()
      if (syncSchema.schemasToSync.length > 0) {
        this.collections = this.collections.concat(syncSchema.schemasToSync)
      }

      if (syncSchema.schemasToUnsync.length > 0) {
        this.removeCollections(syncSchema)
      }

      return syncSchema
    }

    private getSchemasToSync () {
      return this.model
        .find({})
        .exec()
        .then(schemas => {
          let syncSchema: SyncSchema = new SyncSchema()
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

    private comparer (otherArray) {
      return function (current) {
        return (
          otherArray.filter(function (other) {
            return other[this.collectionName] === current[this.collectionName]
          }).length === 0
        )
      }
    }

    private removeCollections (syncSchema: SyncSchema) {
      for (let unsync of syncSchema.schemasToUnsync) {
        for (let c of this.collections) {
          if (unsync[this.collectionName] === c[this.collectionName]) {
            this.collections.splice(this.collections.indexOf(c), 1)
          }
        }
      }
    }
  }
}
