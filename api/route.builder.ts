import { Application } from 'express';
import { Schema } from 'mongoose';
import * as restful from 'node-restful';
import { Route } from '../models/route';
import { PatchHandler } from './patch.handler';

export class RouteBuilder {
  private route: Route;
  private mongooseSchema: Schema<any>;

  /**
   *
   */
  constructor(route: Route) {
    try {
      this.route = route;
      this.mongooseSchema = new Schema(JSON.parse(route.mongooseSchema), route.strict);
    } catch (error) {
      console.error(error);
      throw error;
    }
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
