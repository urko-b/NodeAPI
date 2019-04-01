import * as bodyParser from 'body-parser'
import * as express from 'express'
import * as i18n from 'i18n'
import * as methodOverride from 'method-override'
import * as morgan from 'morgan'
import { RoutesHandler } from './api/routes.handler'
import { SyncHandler } from './api/sync.handler'
import { AuthController } from './controllers/auth.controller'

export class App {
  public app: express.Application
  protected routesHandler: RoutesHandler
  protected syncHandler: SyncHandler
  protected port: string
  protected authController: AuthController

  constructor(port: string) {
    this.port = port
    this.app = express()
  }

  public init() {
    this.routesHandler = new RoutesHandler(this.app)
    this.syncHandler = new SyncHandler(this.routesHandler)
    this.authController = new AuthController()

    this.authController.init()
    this.initi18n()
    this.useMiddlewares()
    this.mountRoutes().catch(err => {
      console.warn(err)
    })
    this.syncHandler.setSyncSchemaRoute()
  }

  public run = () => {
    this.app.listen(this.port, () => {
      console.info(`API REST running in http://localhost:${this.port}`)
    })
  }

  public useMiddlewares(): void {
    this.app.use(morgan('dev'))

    this.useBodyParser()

    this.app.use(methodOverride())

    this.app.use(this.tokenMiddleware)

    this.app.use(i18n.init)
    this.app.use(this.i18nSetLocaleMiddleware)
  }

  public useBodyParser() {
    this.app.use(bodyParser.urlencoded({ extended: true }))
    this.app.use(bodyParser.json({ type: 'application/vnd.api+json' }))
    this.app.use(bodyParser.json({ type: 'application/json-patch' }))
    this.app.use(bodyParser.json())
  }

  public initi18n(): void {
    i18n.configure({
      cookie: 'language-cookie',
      directory: __dirname + '/locales',
      locales: ['en', 'es', 'fr', 'es', 'pt', 'de']
    })
  }

  private tokenMiddleware = async (req, res, next) => {
    const secret: string = req.header('token')
    if (secret === undefined) {
      res.status(401)
      next('Unauthorized')
    }

    const isTokenValid: boolean = await this.authController.isTokenValid(secret)
    if (isTokenValid === false) {
      res.status(401)
      next('The token provided is not valid')
    }

    next()
  }

  private i18nSetLocaleMiddleware(req, res, next) {
    if (
      req.cookies !== undefined &&
      req.cookies['language-cookie'] !== undefined
    ) {
      res.setLocale(req.cookies['language-cookie'])
    }
    next()
  }

  private async mountRoutes() {
    try {
      await this.routesHandler.init()
    } catch (error) {
      console.error('Unexpected error occurred in mountRoutes()', error)
    }
  }
}
