import * as chai from 'chai'
import * as i18n from 'i18n'
import 'mocha'
import * as mongoose from 'mongoose'
import { App } from '../app'
import { TestHelper } from './test.module'

describe('Testing app', () => {
  it('init(): should mount routes', done => {
    const port: string = '1111'
    const app = new App(port)
    app.init()

    chai.assert(
      chai.expect(mongoose.connection.models.system_tokens).not.be.undefined
    )
    TestHelper.removeMongooseModels()
    done()
  })

  it('initi18n(): should create some locales', done => {
    const port: string = '1112'
    const app = new App(port)
    TestHelper.removei18nLocales()
    app.initi18n()

    chai.assert(chai.expect(i18n.getLocales()).to.be.an('array').not.be.empty)
    done()
  })

  it('useMiddlewares(): should use morgan', done => {
    const port: string = '1111'
    const app = new App(port)
    app.useMiddlewares()

    const useMorgan = TestHelper.middlewareExists(app.app, 'logger')
    chai.assert(chai.expect(useMorgan).is.true)
    done()
  })

  it('useMiddlewares(): should use bodyParser', done => {
    const port: string = '1111'
    const app = new App(port)
    app.useBodyParser()

    const bodyParser = TestHelper.middlewareExists(app.app, 'jsonParser')

    chai.assert(chai.expect(bodyParser).is.true)
    done()
  })

  it('useMiddlewares(): should use methodOverride', done => {
    const port: string = '1111'
    const app = new App(port)
    app.useMiddlewares()

    const methodOverride = TestHelper.middlewareExists(
      app.app,
      'methodOverride'
    )

    chai.assert(chai.expect(methodOverride).is.true)
    done()
  })

  it('useMiddlewares(): should use tokenMiddleware', done => {
    const port: string = '1111'
    const app = new App(port)

    app.useMiddlewares()
    const tokenMiddleware = TestHelper.middlewareExists(
      app.app,
      'tokenMiddleware'
    )

    chai.assert(chai.expect(tokenMiddleware).is.true)
    done()
  })

  it('useMiddlewares(): should use i18n', done => {
    const port: string = '1111'
    const app = new App(port)
    app.useMiddlewares()

    const i18n = TestHelper.middlewareExists(app.app, 'i18nInit')

    chai.assert(chai.expect(i18n).is.true)
    done()
  })
})
