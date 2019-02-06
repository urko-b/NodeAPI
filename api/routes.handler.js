'use strict';

const mongoose = require('mongoose');
var restful = require('node-restful');
restful.mongoose = mongoose;

const models = require('../models/model').routes;
const dbSchema = require('../schemas/_cluster.schema');
const ObjectId = mongoose.Types.ObjectId;


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
    app.patch(`/${route}/:id`, function (req, res) {
        var patchObject = req.body;
        var query = patchObject.query;
        var id = req.params.id;
        var findBy = { _id: new ObjectId(id) };
        var arrayFilters = mongooseFindBy(schema, query, patchObject);

        app[resource].findOneAndUpdate(findBy, patchObject, { arrayFilters: arrayFilters, new: true }, (err, resource) => {
            console.log('err', err);
            if (err) {
                return res.status(400).send({ msg: 'Update failed!' });
            }
            return res.status(200).send(resource);
        });
    });
};

var mongooseFindBy = function (schema, query, patchObject) {
    var arrayFilters = [];
    delete patchObject.query;
    if (query != undefined && query != null) {
        query.split(',').forEach(function (queryField) {
            var field = queryField.split('=')[0];
            var value = queryField.split('=')[1];

            if (field === 'id' || field === '_id' || field.split('.').includes('id') || field.split('.').includes('_id')) {
                value = new ObjectId(value);
            }

            var newField = field;
            for (const prop in patchObject) {
                //console.log(`obj.${prop} = ${patchObject[prop]}`);
                if (prop.split('.').length > 0) {
                    newField = '';
                    //si tiene un punto la propiedad que estamos modificando puede tratarse de un array
                    //  si es un array, hacemos un for sobre todos los . que haya, porque puede ser 
                    //  un update a una propiedad anidada
                    var subdocumentoProp = prop.split('.');
                    subdocumentoProp.forEach(function (element, index) {
                        if (index == subdocumentoProp.length) {
                            return;
                        }

                        if (index > 0 && index < subdocumentoProp.length) {
                            newField += '.';
                        }
                        if (Array.isArray(schema[prop.split('.')[0]])) {
                            newField += `${element}.$[${element}]`;
                            //patchObject[prop] = `${patchObject[prop].split('.')[0]}.$.${patchObject[prop].split('.')[1]}`
                        }
                        //if index %
                    });

                }
            }
            console.log('newField', newField);

            var objectToPush = {};
            objectToPush[newField] = value;
            arrayFilters.push(objectToPush);
        });
    }
    return arrayFilters;
};

module.exports = function (app) {
    models.forEach(function (model) {
        registerRoute(model, app);
    });
};