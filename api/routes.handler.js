'use strict';

const mongoose = require('mongoose');
var restful = require('node-restful');
restful.mongoose = mongoose;

const models = require('../models/model').routes;
const dbSchema = require('../schemas/_cluster.schema');
const ObjectId = mongoose.Types.ObjectId;

var jsonpatch = require('fast-json-patch')


var registerRoute = function (model, app) {
    var resource = model.resource;
    var modelName = model.model;
    var schema = dbSchema[modelName];
    var strict = model.strict;
    var routeName = model.routeName;

    var route = app[resource] = restful.model(modelName, mongoose.Schema(schema, strict), modelName)
        .methods(model.methods)
        .updateOptions(model.updateOptions);

    route.register(app, routeName);
    if (model.methods.includes('patch')) {
        registerPatch(app, schema, routeName, resource);
    }
};

var registerPatch = function (app, schema, route, resource) {
    app.patch(`${route}/:id`, function (req, res) {
        var patches = req.body;
        var id = req.params.id;

        app[resource].findOne({ _id: new ObjectId(id) }, (err, doc) => {
            var errors = jsonpatch.validate(patches, doc);
            if (errors != undefined) {
                var responseErrors = '';
                if (Array.isArray(errors)) {
                    for (var i = 0; i < errors.length; i++) {
                        responseErrors += `Errors in${errors[i]} in ${patches[i]}`
                    }
                } else
                    responseErrors = `${errors.name}: ${errors.message} --> ${JSON.parse(errors.operation)}`;

                return res.status(400).send(responseErrors);
            }

            var documentPatched = jsonpatch.applyPatch(doc, patches, true);
            app[resource].updateOne({ _id: new ObjectId(id) }, { $set: documentPatched.newDocument }, { new: true }, (err, newDoc) => {
                return res.status(200).send(newDoc);
            });
        });
    });
};


module.exports = function (app) {
    models.forEach(function (model) {
        registerRoute(model, app);
    });
};