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

    resource.register(app, `/${config.WEBAPINAME}/${config.VERSION}/${resourceName}`);
    if (route.methods.includes('patch')) {
        registerPatch(app, schema, resourceName);
    }
};

var registerPatch = function (app, schema, resourceName) {
    app.patch(`/${config.WEBAPINAME}/${config.VERSION}/${resourceName}/:id`, function (req, res) {
        var patchObject = req.body;
        var query = patchObject.query;
        var id = req.params.id;
        var findBy = { _id: new ObjectId(id) };
        var arrayFilters = mongooseFindBy(schema, query, patchObject);

        app[resourceName].findOneAndUpdate(findBy, patchObject, { arrayFilters: arrayFilters, new: true }, (err, resource) => {
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