import * as chai from 'chai';
import chaiHttp = require('chai-http');
import * as dotenv from 'dotenv';
import 'mocha';

import bodyParser = require('body-parser');
import { RouteBuilder } from '../../api/route.builder';
import { App } from '../../app';
import { Route } from '../../models/model.module';


describe('Testing route.builder', () => {
  const methods = ['get', 'post', 'put', 'patch', 'delete'];

  it('buildRoute(): Should build GET, POST, PUT, DELETE routes for TestBuilderCollection', (done) => {
    const route: Route = new Route('TestBuilderCollection', methods, 'TestBuilderPatchCollection', '{"name": "String"}');
    const routeBuilder: RouteBuilder = new RouteBuilder(route);

    const restfulRoute = routeBuilder.buildRoute();
    chai.assert(chai.expect(restfulRoute).is.not.null.and.is.not.undefined);
    done();
  });

  it('buildRoute(): Should build GET, POST, PUT, DELETE routes for TestBuilderCollection', (done) => {
    const route: Route = new Route('TestBuilderPatchCollection', methods, 'TestBuilderPatchCollection', '{"name": "String"}');
    const routeBuilder: RouteBuilder = new RouteBuilder(route);

    chai.use(chaiHttp);
    dotenv.config();
    const webApi: App = new App(process.env.PORT);
    webApi.app.use(bodyParser.urlencoded({ extended: true }));
    webApi.app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
    webApi.app.use(bodyParser.json({ type: 'application/json-patch' }));
    webApi.app.use(bodyParser.json());

    routeBuilder.registerPatch(webApi.app);

    const isTestBuilderPatchCollectionRegistered = webApi.app._router.stack.some(r => {
      if (r.route === undefined) {
        return;
      }
      return r.route.path === 'TestBuilderPatchCollection/:id';
    });

    chai.assert(chai.expect(isTestBuilderPatchCollectionRegistered).is.true);
    done();
  });

});

