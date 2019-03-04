import * as express from 'express'
import * as mongoose from 'mongoose'
import * as restful from 'node-restful'
restful.mongoose = mongoose

import { Models, Route, SyncRoutes } from '../models/model'
import * as patchHandler from './patch.handler'
import { LogHandler, Log } from '../log/log.handler'

export class RoutesHandler {
  private _app: express.Application
  public get app (): express.Application {
    return this._app
  }
  protected models: Models
  protected logHandler: LogHandler
  protected collaboratorId: string

  constructor (app: express.Application) {
    this._app = app
    this.models = new Models()
    this.logHandler = new LogHandler(this._app)
  }

  public async initRoutes () {
    try {
      await this.models.Init()
      this.registerRoutes(this.models.routes)
    } catch (error) {
      throw error
    }
  }

  private registerRoutes (routes: Array<Route>) {
    for (let model of routes) {
      this.registerRoute(model)
    }
  }

  public registerRoute (model: Route) {
    let collectionName: string = model.collectionName
    let schema: any = JSON.parse(model.mongooseSchema)
    let strict: object = model.strict
    let routeName: string = model.route

    let mongooseSchema = new mongoose.Schema(schema, strict)    
    this.setPostSaveMiddleware(mongooseSchema, collectionName)
    this.setPostRemoveMiddleware(mongooseSchema, collectionName)

    let route = (this._app.route[collectionName] = restful
      .model(collectionName, mongooseSchema, collectionName)
      .methods(model.methods)
      .updateOptions(model.updateOptions))

    route.before('post', (req, res, next) => {
      let collaboratorId: string = req.header('collaboratorId')
      this.collaboratorId = collaboratorId
      next()
    })
    // route.before('put', this.setCollaboratorId)
    // route.before('delete', this.setCollaboratorId)

    route.register(this._app, routeName)

    if (model.methods.includes('patch')) {
      let patch = new patchHandler.PatchHandler(
        this._app,
        routeName,
        collectionName
      )
      patch.registerPatch()
    }
  }

  private setPostSaveMiddleware (mongooseSchema: mongoose.Schema<any>, collectionName: string) {
    mongooseSchema.post('save', async doc => {
      let log: Log = new Log(
        new mongoose.Types.ObjectId(this.collaboratorId),
        'post',
        collectionName,
        null,
        null,
        doc.modifiedPaths().join(', ')
      )
      await this.logHandler.insertLog(log)
    })
  }
  
  private setPostRemoveMiddleware(mongooseSchema: mongoose.Schema<any>, collectionName: string) {
    mongooseSchema.post('remove', async doc => {
      let log: Log = new Log(
        new mongoose.Types.ObjectId(this.collaboratorId),
        'remove',
        collectionName,
        null,
        null,
        doc.modifiedPaths().join(', ')
      )
      await this.logHandler.insertLog(log)
    })
  }

  
  private setCollaboratorId = (req, res, next) => {
    let collaboratorId: string = req.header('collaboratorId')
    this.collaboratorId = collaboratorId
    next()
  }


  public async syncRoutes () {
    let syncRoutes: SyncRoutes = await this.models.syncRoutes()

    let routesToUnsync = syncRoutes.routesToUnsync
    let routesToSync = syncRoutes.routesToSync

    let synchedRoutes = this.synchedRoutes(routesToSync)
    let unsynchedRoutes = this.unsynchedRoutes(routesToUnsync)

    let result: string
    if (synchedRoutes !== '') {
      result = synchedRoutes
    }

    if (unsynchedRoutes !== '') {
      if (result !== '') {
        result += '\n'
      }
      result += unsynchedRoutes
    }
    return result
  }

  private synchedRoutes (routesToSync: Array<Route>) {
    if (
      routesToSync === undefined ||
      routesToSync === null ||
      routesToSync.length <= 0
    ) {
      return 'Synched Routes: All up to date'
    }

    this.registerRoutes(routesToSync)
    return `Synched Routes: ${routesToSync.map(r => r.collectionName).join()}`
  }

  private unsynchedRoutes (routesToUnsync: Array<string>) {
    if (
      routesToUnsync === undefined ||
      routesToUnsync === null ||
      routesToUnsync.length <= 0
    ) {
      return 'Unsynched Routes: All up to date'
    }

    for (let unsync of routesToUnsync) {
      this.app._router.stack = this.app._router.stack.filter(r => {
        if (r.route === undefined) {
          return r
        }
        return !r.route.path.includes(unsync)
      })
    }

    return `Unsynched Routes: ${routesToUnsync.join()}`
  }
}
