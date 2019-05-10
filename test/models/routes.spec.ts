import * as chai from 'chai';
import 'mocha';

import { Route, Routes } from '../../models/model.module';
import { CollectionSchema } from '../../schemas/schema.module';


describe('Testing models.handler', () => {
  let routes: Routes;

  beforeEach(() => {
    routes = new Routes();
  });

  it('addRoute(): Should add new route to route array', (done) => {
    const collectionSchema: CollectionSchema = new CollectionSchema('TestCollection', '{"name": "String"}');
    routes.addRoute(collectionSchema);

    chai.assert(chai.expect(routes.getRoutes()).to.have.length(1));
    done();
  });

  it('pushRoute(): Should add new route to route array', (done) => {
    const route: Route = new Route('TestCollection', [], 'TestCollection', '{"name": "String"}');
    routes.pushRoute(route);

    chai.assert(chai.expect(routes.getRoutes()).to.have.length(1));
    done();
  });

  it('pushRoutes(): Should add new route to route array', (done) => {
    const additionalRoutes: Routes = new Routes();
    const route: Route = new Route('TestCollection', [], 'TestCollection', '{"name": "String"}');
    additionalRoutes.pushRoute(route);

    routes.pushRoutes(additionalRoutes);

    chai.assert(chai.expect(routes.getRoutes()).to.have.length(1));
    done();
  });

  it('getRoutes(): Should add new route, then get route array and verify has 1 route', (done) => {
    const collectionSchema: CollectionSchema = new CollectionSchema('TestCollection', '{"name": "String"}');
    routes.addRoute(collectionSchema);

    chai.assert(chai.expect(routes.getRoutes()).to.have.length(1));
    done();
  });

  it('hasRoutes(): Should add new route to route array and verify it has routes', (done) => {
    const collectionSchema: CollectionSchema = new CollectionSchema('TestCollection', '{"name": "String"}');
    routes.addRoute(collectionSchema);

    chai.assert(chai.expect(routes.hasRoutes()).is.true);
    done();
  });
});
