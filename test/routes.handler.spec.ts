import 'mocha'
import * as chai from 'chai'
import chaiHttp = require('chai-http')
import httpMocks = require('node-mocks-http')

import * as server from '../app'
import { Route } from '../models/model.handler'
import { RoutesHandler } from '../api/routes.handler'

describe('API Generic Entity Request', () => {
  it('should return OK Tree Get request', done => {
    chai.use(chaiHttp)
    let app = new server.App(process.env.PORT)
    let routesHandler: RoutesHandler = new RoutesHandler(app.app)
    let model: Route = new Route(
      'tree',
      ['get', 'post'],
      '/tree',
      '{"name": { "type":"String","required": true }}',
      { new: true }
    )

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

  it('should set collaboratorId property from collaboratorId request header', done => {
    chai.use(chaiHttp)
    let app = new server.App(process.env.PORT)
    let routesHandler: RoutesHandler = new RoutesHandler(app.app)
    let collaboratorId: string = '5c839d1063bad113d8b5aaed'

    let req = httpMocks.createRequest({
      method: 'GET',
      url: '/tree',
      headers: { 'collaboratorId': collaboratorId }
    })
    let next = (() => { return true })
    routesHandler.setCollaboratorId(req, {}, next)
    chai.expect(routesHandler.collaboratorId).is.equal(collaboratorId)
    done()
  })

})
