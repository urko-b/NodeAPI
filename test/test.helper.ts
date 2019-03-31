import * as mongoose from 'mongoose'
export class TestHelper {
  /**
   * @remarks
   * Remove each mongoose model registered
   */
  public static removeMongooseModels = () => {
    for (const key in mongoose.connection.models) {
      if (mongoose.connection.models.hasOwnProperty(key)) {
        delete mongoose.connection.models[key]
      }
    }
  }

  /**
   * @remarks
   * Remove collections_schemas from mongoose models
   */
  public static removeMongooseModelCollectionsSchemas = () => {
    delete mongoose.connection.models.collections_schemas
  }

  /**
   * @remarks
   * Remove audit_log from mongoose models
   */
  public static removeMongooseModelAuditLog = () => {
    delete mongoose.connection.models.audit_log
  }

  public static middlewareExists(app, name) {
    return !!app._router.stack.filter(layer => {
      if (layer && layer.handle) {
        console.log('layer.handle', layer.handle)
      }
      return layer && layer.handle && layer.handle.name === name
    }).length
  }
}
