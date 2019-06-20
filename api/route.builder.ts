import { Application } from 'express';
import { Schema } from 'mongoose';
import * as restful from 'node-restful-improved';
import { Route } from '../models/route';
import { PatchHandler } from './patch.handler';
import { MongooseSchemaMapper } from '../schemas/type-mapper/mongoose-schema-mapper';

export class RouteBuilder {
  private route: Route;
  private mongooseSchema: Schema<any>;

  /**
   *
   */
  constructor(route: Route) {
    try {
      this.route = route;
      this.mongooseSchema = this.getMongooseSchema(route);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private getMongooseSchema(route: Route) {
    const mappedSchema = MongooseSchemaMapper.map(JSON.parse(route.mongooseSchema));
    return new Schema(mappedSchema, route.strict);
  }


  public buildRoute() {
    return restful
      .model(this.route.collectionName, this.mongooseSchema, this.route.collectionName)
      .methods(this.route.methods)
      .updateOptions(this.route.updateOptions);
  }

  public registerPatch(expressApp: Application) {
    if (this.route.methods.includes('patch')) {
      const patch = new PatchHandler(
        expressApp,
        this.route.route,
        this.route.collectionName
      );
      patch.registerPatch();
    }
  }
}
