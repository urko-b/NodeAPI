import * as express from 'express'
import * as mongoose from 'mongoose'
import * as restful from 'node-restful'
restful.mongoose = mongoose

import { Log, LogHandler } from '../log/log.module'
import { Models, Route, SyncRoutes } from '../models/model.module'
import * as patchHandler from './patch.handler'

export class RoutesHandler {
  public get app(): express.Application {
    return this._app
  }
  public get collaboratorId(): string {
    return this._collaboratorId
  }
  protected models: Models
  protected logHandler: LogHandler
  private _app: express.Application

  private _collaboratorId: string

  constructor(app: express.Application) {
    this._app = app
    this.models = new Models()
    this.logHandler = new LogHandler(this._app)
  }

  public async init() {
    try {
      await this.models.init()
      this.registerRoutes(this.models.routes)
    } catch (error) {
      throw error
    }
  }

  public registerRoute(routeModel: Route) {
    const collectionName: string = routeModel.collectionName
    const schema: any = JSON.parse(routeModel.mongooseSchema)
    const strict: object = routeModel.strict
    const routeName: string = routeModel.route

    const mongooseSchema = new mongoose.Schema(schema, strict)

    const route = (this._app.route[collectionName] = restful
      .model(collectionName, mongooseSchema, collectionName)
      .methods(routeModel.methods)
      .updateOptions(routeModel.updateOptions))

    route.before('post', this.setCollaboratorId)
    route.before('put', this.setCollaboratorId)
    route.before('delete', this.setCollaboratorId)

    route.register(this._app, routeName)

    this.listenOnChanges(collectionName)

    if (routeModel.methods.includes('patch')) {
      const patch = new patchHandler.PatchHandler(
        this._app,
        routeName,
        collectionName
      )
      patch.registerPatch()
    }
  }

  /**
   * @remarks
   * This function get synched/unsynched models from an instance of {@link SyncRoutes}
   * Then, it checks what routes should "sync" and it register to api endpoints.
   * And if there is any route to "unsync" it will remove from api endpoints.
   *
   * @returns Object with two fields: synchedRoutes and unsynchedRoutes.
   * Each string field will print wich collections has been synched/unsynched.
   * If there aren't any to sync/unsync it will output "All up to date"
   */
  public async syncRoutes(): Promise<any> {
    const syncRoutes: SyncRoutes = await this.models.syncRoutes()

    const routesToUnsync = syncRoutes.routesToUnsync
    const routesToSync = syncRoutes.routesToSync

    this.registerRoutes(routesToSync)
    const routesToSyncNames: string[] = this.getRegisteredRoutes(routesToSync)
    const synchedRoutes = this.synchedRoutes(routesToSyncNames)

    const routesToUnsyncNames: string[] = this.getUnregisteredRoutes(
      routesToUnsync
    )
    this.removeRoutes(routesToUnsyncNames)
    const unsynchedRoutes = this.unsynchedRoutes(routesToUnsyncNames)

    const result: any = {}
    if (synchedRoutes !== '') {
      result.synchedRoutes = synchedRoutes
    }

    if (unsynchedRoutes !== '') {
      result.unsynchedRoutes = unsynchedRoutes
    }
    return result
  }

  /**
   * @remarks
   * @param routes array of {@link Route}
   *
   * Loop each route and call {@link RoutesHandler.registerRoute}
   * in order to register each route
   */
  public registerRoutes(routes: Route[]) {
    if (routes === undefined || routes == null || routes.length <= 0) {
      return
    }
    for (const model of routes) {
      this.registerRoute(model)
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
    const collaboratorId: string = req.get('collaboratorId')
    this._collaboratorId = collaboratorId
    next()
  }

  /**
   *
   * @param routesToSync array of string with the routes registered to api
   * @returns "All up to date" if routesToSync is empty,
   * instead, it will output a string with all routes
   * synched each separated by comma
   */
  public synchedRoutes = (routesToSync: string[]) => {
    if (
      routesToSync === undefined ||
      routesToSync === null ||
      routesToSync.length <= 0
    ) {
      return 'All up to date'
    }

    return `${routesToSync.join()}`
  }

  /**
   *
   * @param routesToUnsync array of string with the routes registered to api
   * @returns "All up to date" if routesToUnsync is empty,
   * instead, it will output a string with all routes
   * "unsynched" each separated by comma
   */
  public unsynchedRoutes = (routesToUnsync: string[]) => {
    if (
      routesToUnsync === undefined ||
      routesToUnsync === null ||
      routesToUnsync.length <= 0
    ) {
      return 'All up to date'
    }

    return `${routesToUnsync.join()}`
  }

  /**
   * @param routesToUnsync array with routes to remove from api endpoints
   */
  public removeRoutes = (routesToUnsync: string[]) => {
    if (routesToUnsync == null || routesToUnsync.length <= 0) {
      return
    }

    for (const unsync of routesToUnsync) {
      this.app._router.stack = this.app._router.stack.filter(r => {
        if (r.route === undefined) {
          return r
        }
        return !r.route.path.includes(unsync)
      })
    }
  }

  private getUnregisteredRoutes(routesToUnsync: any[]) {
    let routesToUnsyncNames: string[]
    if (routesToUnsync !== undefined) {
      routesToUnsyncNames = routesToUnsync
    }
    return routesToUnsyncNames
  }

  private getRegisteredRoutes(routesToSync: any[]) {
    let routesToSyncNames: string[]
    if (routesToSync !== undefined) {
      routesToSyncNames = routesToSync.map(r => r.collectionName)
    }
    return routesToSyncNames
  }

  private listenOnChanges(collectionName: string) {
    mongoose
      .model(collectionName)
      .collection.watch()
      .on('change', async data => {
        if (
          data.operationType !== 'update' &&
          data.operationType !== 'delete'
        ) {
          return
        }

        const log: Log = new Log(
          new mongoose.Types.ObjectId(this._collaboratorId),
          data.operationType,
          collectionName,
          JSON.stringify(data),
          null,
          JSON.stringify(data.updateDescription)
        )
        await this.logHandler.insertOne(log)
      })
  }
}
