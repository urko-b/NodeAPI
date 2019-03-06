import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as methodOverride from 'method-override'
import * as morgan from 'morgan'
import * as i18n from 'i18n'
import { RoutesHandler } from './api/routes.handler'
import { SyncHandler } from './api/sync.handler'
import { AuthController } from './controllers/auth.controller';

export class App {
  public app: express.Application
  protected routesHandler: RoutesHandler
  protected syncHandler: SyncHandler
  protected port: string
  protected authController: AuthController

  constructor (port: string) {
    this.port = port
    this.app = express()
  }

  public init () {
    this.routesHandler = new RoutesHandler(this.app)
    this.syncHandler = new SyncHandler(this.routesHandler)
    this.authController = new AuthController()
    
    this.initi18n()
    this.useMiddlewares()
    this.mountRoutes().catch(err => {
      console.warn(err)
    })
    this.syncHandler.syncSchemas()
  }

  private initi18n (): void {
    i18n.configure({
      // setup some locales - other locales default to en silently
      locales: ['en', 'es', 'fr', 'es', 'pt', 'de'],
      // sets a custom cookie name to parse locale settings from
      cookie: 'language-cookie',
      // where to store json files - defaults to './locales'
      directory: __dirname + '/locales'
    })
  }

  private useMiddlewares (): void {
    this.app.use(morgan('dev'))
    this.app.use(bodyParser.urlencoded({ extended: true }))
    this.app.use(bodyParser.json({ type: 'application/vnd.api+json' }))
    this.app.use(bodyParser.json({ type: 'application/json-patch' }))
    this.app.use(bodyParser.json())
    this.app.use(methodOverride())
    
    this.app.use(this.secretMiddleware)

    this.app.use(i18n.init)
    this.app.use(this.i18nSetLocaleMiddleware)
  }

  private i18nSetLocaleMiddleware (req, res, next) {
    if (
      req.cookies !== undefined &&
      req.cookies['language-cookie'] !== undefined
    ) {
      res.setLocale(req.cookies['language-cookie'])
    }
    next()
  }

  private secretMiddleware = async (req, res, next) => {
    let secret: string = req.header('secret')
    if (secret === undefined) {
      res.status(401)
      next('Unauthorized')
    }

    let isSecretValid: boolean = await this.authController.isSecretValid(secret)
    if (isSecretValid === false) {
      res.status(401)
      next('The secret provided is not valid')
    }

    next()
  }

  private async mountRoutes () {
    try {
      await this.routesHandler.initRoutes()
    } catch (error) {
      console.error('Unexpected error occurred in mountRoutes()', error)
    }
  }

  public Run () {
    this.app.listen(this.port, () => {
      console.info(
        `API REST running in http://localhost:${this.port}`
      )
    })
  }
}
