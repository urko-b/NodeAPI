import { Application } from 'express';
import * as mongoose from 'mongoose';
import * as restful from 'node-restful';
restful.mongoose = mongoose;

import { Log, LogHandler } from '../log/log.module';
import { ModelHandler, Route, SyncRoutes } from '../models/model.module';
import { Routes } from '../models/routes';
import { RouteBuilder } from './route.builder';
import { SyncRoutesResponse } from './sync-routes-response';

export class RoutesHandler {

  private expressApp: Application;
  protected isDevelopment: boolean;

  protected models: ModelHandler;
  protected logHandler: LogHandler;

  private collaboratorId: string;

  constructor(app: Application, isDevelopment: boolean = false) {
    this.expressApp = app;
    this.models = new ModelHandler();
    this.logHandler = new LogHandler(this.expressApp);
    this.isDevelopment = isDevelopment;
  }

  public get app(): Application {
    return this.expressApp;
  }
  public getCollaboratorId(): string {
    return this.collaboratorId;
  }

  public async init() {
    try {
      await this.logHandler.init();
      await this.models.init();
      this.registerRoutes(this.models.getRoutes());
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   *
   * @param routeModel {@link Route} Entity to mount api routing
   * @remarks
   * Set mongoose model for this entity and mount each routing (GET, POST, PUT, DELETE, PATCH)
   */
  public registerRoute(routeModel: Route) {
    try {
      const collectionName: string = routeModel.collectionName;
      const routeName: string = routeModel.route;

      const routeBuilder: RouteBuilder = new RouteBuilder(routeModel);
      const route = routeBuilder.buildRoute();

      route.before('post', this.setCollaboratorId);
      route.before('put', this.setCollaboratorId);
      route.before('delete', this.setCollaboratorId);

      route.register(this.expressApp, routeName);

      if (!this.isDevelopment) {
        this.listenOnChanges(collectionName);
      }

      routeBuilder.registerPatch(this.expressApp);

    } catch (error) {
      console.log(error);
      throw error;
    }
  }


  /**
   * @remarks
   * This function get synced/unsynced models from an instance of {@link SyncRoutes}
   * Then, it checks what routes should "sync" and it register to api endpoints.
   * And if there is any route to "unsync" it will remove from api endpoints.
   *
   * @returns Object with two fields: syncedRoutes and unsyncedRoutes.
   * Each string field will print wich collections has been synced/unsynced.
   * If there aren't any to sync/unsync it will output "All up to date"
   */
  public async sync(): Promise<any> {
    try {
      const syncRoutes: SyncRoutes = await this.models.syncRoutes();

      const routesToSync = syncRoutes.routesToSync;
      this.registerRoutes(routesToSync);
      const routesToSyncNames: string[] = this.getRoutesToSync(routesToSync);
      const syncedRoutes = this.getSyncedRoutes(routesToSyncNames);

      const routesToUnsync = syncRoutes.routesToUnsync;
      const routesToUnsyncNames: string[] = this.getRoutesToUnsync(routesToUnsync);
      this.removeRoutes(routesToUnsyncNames);
      const unsyncedRoutes = this.getUnsyncedRoutes(routesToUnsyncNames);

      const syncRoutesResponse: SyncRoutesResponse = new SyncRoutesResponse(syncedRoutes, unsyncedRoutes);
      return syncRoutesResponse;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * @remarks
   * @param routes array of {@link Route}
   *
   * Loop each route and call {@link RoutesHandler.registerRoute}
   * in order to register each route
   */
  public registerRoutes(routes: Routes) {
    if (routes === undefined || routes == null || !routes.hasRoutes()) {
      return;
    }

    for (const model of routes.getRoutes()) {
      this.registerRoute(model);
    }
  }

  /**
   * @remarks
   * Express middleware to get the collaboratorId
   * from request headers.
   * If the request suplies that header, then we
   * set our private field _collaboratorId with that value
   */
  public setCollaboratorId = (req, res, next) => {
    try {
      const collaboratorId: string = req.get('collaboratorId');
      this.collaboratorId = collaboratorId;
      next();
    } catch (error) {
      next();
    }
  }

  /**
   *
   * @param routesToSync array of string with the routes registered to api
   * @returns "All up to date" if routesToSync is empty,
   * instead, it will output a string with all routes
   * synced each separated by comma
   */
  public getSyncedRoutes = (routesToSync: string[]): string => {
    if (
      routesToSync === undefined ||
      routesToSync === null ||
      routesToSync.length <= 0
    ) {
      return 'All up to date';
    }

    return `${routesToSync.join()}`;
  }

  /**
   *
   * @param routesToUnsync array of string with the routes registered to api
   * @returns "All up to date" if routesToUnsync is empty,
   * instead, it will output a string with all routes
   * "unsynced" each separated by comma
   */
  public getUnsyncedRoutes = (routesToUnsync: string[]): string => {
    if (
      routesToUnsync === undefined ||
      routesToUnsync === null ||
      routesToUnsync.length <= 0
    ) {
      return 'All up to date';
    }

    return `${routesToUnsync.join()}`;
  }

  /**
   * @param routesToUnsync array with routes to remove from api endpoints
   * @remarks
   * This function is responsible of removing the routes passed as parameter from api
   */
  public removeRoutes = (routesToUnsync: string[]) => {
    if (routesToUnsync == null || routesToUnsync.length <= 0) {
      return;
    }

    for (const unsync of routesToUnsync) {
      this.expressApp._router.stack = this.expressApp._router.stack.filter(
        r => {
          if (r.route === undefined) {
            return r;
          }
          return !r.route.path.includes(unsync);
        }
      );
    }
  }

  /**
   *
   * @param routesToUnsync array of objects that represent the routes to unsync
   * @remarks
   * Return a string array with the names of the collections to unsync
   */
  public getRoutesToUnsync(routesToUnsync: any[]): string[] {
    let routesToUnsyncNames: string[];
    if (routesToUnsync !== undefined) {
      routesToUnsyncNames = routesToUnsync;
    }
    return routesToUnsyncNames;
  }

  /**
   *
   * @param routesToSync array of objects that represent the routes to sync
   * @remarks
   * Return a string array with the names of the collections to sync
   */
  public getRoutesToSync(routesToSync: Routes): string[] {
    let routesToSyncNames: string[];
    if (routesToSync !== undefined) {
      routesToSyncNames = routesToSync.getRoutes().map(r => r.collectionName);
    }
    return routesToSyncNames;
  }

  /**
   *
   * @param collectionName The collection to listen to changes
   * @remarks
   * Insert a document on audit_log collection when update/delete is executed
   */
  private listenOnChanges(collectionName: string): void {
    mongoose
      .model(collectionName)
      .collection.watch()
      .on('change', async data => {
        try {
          if (
            data.operationType !== 'update' &&
            data.operationType !== 'delete'
          ) {
            return;
          }

          const log: Log = new Log(
            new mongoose.Types.ObjectId(this.collaboratorId),
            data.operationType,
            collectionName,
            JSON.stringify(data),
            null,
            JSON.stringify(data.updateDescription)
          );
          await this.logHandler.insertOne(log);
        } catch (error) {
          console.error(error);
          throw error;
        }
      });
  }
}
