'use strict';

var restful = require('node-restful');
var mongoose = require('mongoose');
restful.mongoose = mongoose;
var config = require('../config-module.js').config();
var routes = require('./routes.config').routes;
//var dbSchema = require('../schemas/cluster.schema.json');
var dbSchema = require('../schemas/_cluster.schema');
var ObjectId = require('mongoose').Types.ObjectId;
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var morgan = require('morgan');


var registerRoute = function (route, app) {
    var resourceName = route.resource;
    var modelName = route.model;
    var schema = dbSchema[modelName];
    var strict = route.strict;

    var resource = app[resourceName] = restful.model(modelName, mongoose.Schema(schema, strict), modelName)
        .methods(route.methods)
        .updateOptions(route.updateOptions);

    resource.register(app, `/webapi/${config.VERSION}/${resourceName}`);
    if (route.methods.includes('patch')) {
        registerPatch(app, resourceName);
    }
};

var registerPatch = function (app, resourceName) {
    app.patch(`/webapi/${config.VERSION}/${resourceName}/:id`, function (req, res) {
        var patchObject = req.body;
        var query = patchObject.query;
        var id = req.params.id;
        var findBy = mongooseFindBy(id, query, patchObject);
        app[resourceName].findOneAndUpdate(findBy, patchObject, { new: true }, (err, resource) => {
            if (err) {
                return res.status(400).send({ msg: 'Update failed!' });
            }
            return res.status(200).send(resource);
        });
    });
};

var mongooseFindBy = function (id, query, patchObject) {
    var findBy = { _id: new ObjectId(id) };
    if (query != undefined && query != null) {
        query.split(',').forEach(function (queryField) {
            var field = queryField.split('=')[0];
            var value = queryField.split('=')[1];

            if (field === 'id' || field === '_id' || field.split('.').includes('id') || field.split('.').includes('_id')) {
                value = new ObjectId(value);
            }

            findBy[field] = value;

        });
        delete patchObject.query;
    }
    return findBy;
};

module.exports = function (app) {
    app.use(morgan('dev'));
    app.use(bodyParser.urlencoded({ 'extended': 'true' }));
    app.use(bodyParser.json());
    app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
    app.use(methodOverride());

    mongoose.connect(`${config.CLUSTER}`);

    routes.forEach(function (route) {
        registerRoute(route, app);
    });
};