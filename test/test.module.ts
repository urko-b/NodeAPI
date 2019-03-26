import * as mongoose from 'mongoose'
export class TestHelper {
  public static removeMongooseModels = () => {
    // Remove each mongoose model because we need to
    //  add each again using RoutesHandler.init function
    for (const key in mongoose.connection.models) {
      if (mongoose.connection.models.hasOwnProperty(key)) {
        delete mongoose.connection.models[key]
      }
    }
  }
}
