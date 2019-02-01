'use strict';

var bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    morgan = require('morgan'),
    restful = require('node-restful'),
    mongoose = restful.mongoose;

var routes = require('./routes.config').routes;
var dbSchema = require('../schemas/db.schema.json');
var environment = require('../config-module.js').config();


var registerRoute = function (route, app) {
    var resourceName = route.resource;
    var modelName = route.model;
    var schema = dbSchema[modelName];

    var resource = app[`${resourceName}`] = restful.model(modelName, mongoose.Schema(schema), modelName)
        .methods(route.methods)
        .updateOptions(route.updateOptions);

    resource.register(app, `/webapi/${environment.VERSION}/${resourceName}`);
};

module.exports = function (app) {
    app.use(morgan('dev'));
    app.use(bodyParser.urlencoded({ 'extended': 'true' }));
    app.use(bodyParser.json());
    app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
    app.use(methodOverride());

    mongoose.connect(`${environment.CLUSTER}`);

    routes.forEach(function (route) {
        registerRoute(route, app);
    });
};