import * as i18n from 'i18n';
import * as mongoose from 'mongoose';

export class TestHelper {
  /**
   * @remarks
   * Remove each mongoose model registered
   */
  public static removeMongooseModels = () => {
    for (const key in mongoose.connection.models) {
      if (mongoose.connection.models.hasOwnProperty(key)) {
        delete mongoose.connection.models[key];
      }
    }
  }

  /**
   * @remarks
   * Remove collections_schemas from mongoose models
   */
  public static removeMongooseModelCollectionsSchemas = () => {
    delete mongoose.connection.models.collections_schemas;
  }

  public static registerMongooseCollectionSchemas = () => {
    const mongooseSchema = new mongoose.Schema({
      collection_name: String,
      collection_schema: String
    });

    mongoose.connection.model(
      process.env.COLLECTIONS_SCHEMAS,
      mongooseSchema,
      process.env.COLLECTIONS_SCHEMAS
    );
  };

  /**
   * @remarks
   * Remove audit_log from mongoose models
   */
  public static removeMongooseModelAuditLog = () => {
    delete mongoose.connection.models.audit_log;
  }

  public static middlewareExists(app, name) {
    return !!app._router.stack.filter(layer => {
      return layer && layer.handle && layer.handle.name === name;
    }).length;
  }

  public static removei18nLocales = () => {
    i18n.configure({ locales: [] });
  }
}
