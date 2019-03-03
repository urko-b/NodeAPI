import 'mocha'
import * as chai from 'chai'
import chaiHttp = require('chai-http')

import * as server from '../app'
import { Route } from '../models/model'
import { RoutesHandler } from '../api/routes.handler'

describe('API Request', () => {
  it('should return OK Tree Get request', done => {
    chai.use(chaiHttp)

    let app = new server.App(process.env.PORT)
    let model: Route = new Route(
      'tree',
      ['get', 'post'],
      '/tree',
      '{"name": { "type":"String","required": true }}',
      { new: true }
    )
    let routesHandler: RoutesHandler = new RoutesHandler(app.app)

    routesHandler.registerRoute(model)
    app.Run()

    chai
      .request(app.app)
      .get(`/tree`)
      .end((err, res) => {
        chai
          .expect(res)
          .to.have.status(200)
        done()
      })
  })
})
