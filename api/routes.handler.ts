import * as express from 'express'
import * as mongoose from 'mongoose'
import * as restful from 'node-restful'
restful.mongoose = mongoose

import { Log, LogHandler } from '../log/log.module'
import { ModelsHandler, Route, SyncRoutes } from '../models/model.module'
import * as patchHandler from './patch.handler'

export class RoutesHandler {
  public get app(): express.Application {
    return this.expressApp
  }
  public get collaboratorId(): string {
    return this._collaboratorId
  }
  protected models: ModelsHandler
  protected logHandler: LogHandler
  private expressApp: express.Application

  private _collaboratorId: string

  constructor(app: express.Application) {
    this.expressApp = app
    this.models = new ModelsHandler()
    this.logHandler = new LogHandler(this.expressApp)
  }

  public async init() {
    try {
      await this.models.init()
      this.registerRoutes(this.models.routes)
    } catch (error) {
      throw error
    }
  }

  /**
   *
   * @param routeModel {@link Route}
   */
  public registerRoute(routeModel: Route) {
    let collectionName: string
    let schema: any
    let strict: object
    let routeName: string
    try {
      collectionName = routeModel.collectionName
      schema = JSON.parse(routeModel.mongooseSchema)
      strict = routeModel.strict
      routeName = routeModel.route

      const mongooseSchema = new mongoose.Schema(schema, strict)

      const route = (this.expressApp.route[collectionName] = restful
        .model(collectionName, mongooseSchema, collectionName)
        .methods(routeModel.methods)
        .updateOptions(routeModel.updateOptions))

      route.before('post', this.setCollaboratorId)
      route.before('put', this.setCollaboratorId)
      route.before('delete', this.setCollaboratorId)

      route.register(this.expressApp, routeName)

      this.listenOnChanges(collectionName)

      if (routeModel.methods.includes('patch')) {
        const patch = new patchHandler.PatchHandler(
          this.expressApp,
          routeName,
          collectionName
        )
        patch.registerPatch()
      }
    } catch (error) {
      console.log('collectionName', collectionName)
      console.log(error)
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
    const routesToSyncNames: string[] = this.getRoutesToSync(routesToSync)
    const synchedRoutes = this.getSynchedRoutes(routesToSyncNames)

    const routesToUnsyncNames: string[] = this.getRoutesToUnsync(routesToUnsync)
    this.removeRoutes(routesToUnsyncNames)
    const unsynchedRoutes = this.getUnsynchedRoutes(routesToUnsyncNames)

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
  public getSynchedRoutes = (routesToSync: string[]): string => {
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
  public getUnsynchedRoutes = (routesToUnsync: string[]): string => {
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
   * @remarks
   * This function is responsible of removing the routes passed as parameter from api
   */
  public removeRoutes = (routesToUnsync: string[]) => {
    if (routesToUnsync == null || routesToUnsync.length <= 0) {
      return
    }

    for (const unsync of routesToUnsync) {
      this.expressApp._router.stack = this.expressApp._router.stack.filter(
        r => {
          if (r.route === undefined) {
            return r
          }
          return !r.route.path.includes(unsync)
        }
      )
    }
  }

  /**
   *
   * @param routesToUnsync
   */
  public getRoutesToUnsync(routesToUnsync: any[]): string[] {
    let routesToUnsyncNames: string[]
    if (routesToUnsync !== undefined) {
      routesToUnsyncNames = routesToUnsync
    }
    return routesToUnsyncNames
  }

  /**
   *
   * @param routesToSync
   */
  public getRoutesToSync(routesToSync: any[]): string[] {
    let routesToSyncNames: string[]
    if (routesToSync !== undefined) {
      routesToSyncNames = routesToSync.map(r => r.collectionName)
    }
    return routesToSyncNames
  }

  /**
   *
   * @param collectionName
   */
  private listenOnChanges(collectionName: string): void {
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
