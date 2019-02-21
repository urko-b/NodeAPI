
import * as express from 'express';
import * as mongoose from 'mongoose';
import * as restful from 'node-restful';
restful.mongoose = mongoose;

import { Models, Route } from '../models/model';
import * as patchHandler from './patch.handler';



export class RoutesHandler {
    protected app: express.Application;
    protected models: Models;

    constructor(app: express.Application) {
        this.app = app;
        this.models = new Models();
    }

    public async registerRoutes() {
        try {
            await this.models.Init();;

            for (var model of this.models.routes) {
                this.registerRoute(model);
            }
        } catch (error) {
            throw (error);
        }
    }

    private registerRoute(model: Route) {
        let resource: string = model.model;
        let schema: any = JSON.parse(model.mongooseSchema);
        let strict: object = model.strict;
        let routeName: string = model.route;

        let mongooseSchema = new mongoose.Schema(schema, strict);
        let route = this.app.route[resource] = restful.model(resource, mongooseSchema, resource)
            .methods(model.methods)
            .updateOptions(model.updateOptions);

        route.register(this.app, routeName);
        if (model.methods.includes('patch')) {
            let patch = new patchHandler.PatchHandler(this.app, routeName, resource);
            patch.registerPatch();
        }
    };
}
