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
  protected models: Models
  protected logHandler: LogHandler
  private _app: express.Application

  private collaboratorId: string

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

  public registerRoute(model: Route) {
    const collectionName: string = model.collectionName
    const schema: any = JSON.parse(model.mongooseSchema)
    const strict: object = model.strict
    const routeName: string = model.route

    const mongooseSchema = new mongoose.Schema(schema, strict)

    const route = (this._app.route[collectionName] = restful
      .model(collectionName, mongooseSchema, collectionName)
      .methods(model.methods)
      .updateOptions(model.updateOptions))

    route.before('post', this.setCollaboratorId)
    route.before('put', this.setCollaboratorId)
    route.before('delete', this.setCollaboratorId)

    route.register(this._app, routeName)

    this.listenOnChanges(collectionName)

    if (model.methods.includes('patch')) {
      const patch = new patchHandler.PatchHandler(
        this._app,
        routeName,
        collectionName
      )
      patch.registerPatch()
    }
  }

  public async syncRoutes() {
    const syncRoutes: SyncRoutes = await this.models.syncRoutes()

    const routesToUnsync = syncRoutes.routesToUnsync
    const routesToSync = syncRoutes.routesToSync

    const synchedRoutes = this.synchedRoutes(routesToSync)
    const unsynchedRoutes = this.unsynchedRoutes(routesToUnsync)

    let result: Object = new Object()
    if (synchedRoutes !== '') {
      result['synchedRoutes'] = synchedRoutes
    }

    if (unsynchedRoutes !== '') {
      result['unsynchedRoutes'] = unsynchedRoutes
    }
    return result
  }

  private registerRoutes(routes: Route[]) {
    for (const model of routes) {
      this.registerRoute(model)
    }
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
          new mongoose.Types.ObjectId(this.collaboratorId),
          data.operationType,
          collectionName,
          JSON.stringify(data),
          null,
          JSON.stringify(data.updateDescription)
        )
        await this.logHandler.insertOne(log)
      })
  }

  private setCollaboratorId = (req, res, next) => {
    const collaboratorId: string = req.header('collaboratorId')
    this.collaboratorId = collaboratorId
    next()
  }

  private synchedRoutes(routesToSync: Route[]) {
    if (
      routesToSync === undefined ||
      routesToSync === null ||
      routesToSync.length <= 0
    ) {
      return 'All up to date'
    }

    this.registerRoutes(routesToSync)
    return `${routesToSync.map(r => r.collectionName).join()}`
  }

  private unsynchedRoutes(routesToUnsync: string[]) {
    if (
      routesToUnsync === undefined ||
      routesToUnsync === null ||
      routesToUnsync.length <= 0
    ) {
      return 'All up to date'
    }

    for (const unsync of routesToUnsync) {
      this.app._router.stack = this.app._router.stack.filter(r => {
        if (r.route === undefined) {
          return r
        }
        return !r.route.path.includes(unsync)
      })
    }

    return `${routesToUnsync.join()}`
  }
}
