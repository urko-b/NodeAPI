'use strict';

var controller = require('./controller');

var express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    //morgan = require('morgan'),
    restful = require('node-restful'),
    mongoose = restful.mongoose;

    var dbSchema = require('../schema.json');


module.exports = function(app) {
    //app.use(morgan('dev'));
    app.use(bodyParser.urlencoded({'extended':'true'}));
    app.use(bodyParser.json());
    app.use(bodyParser.json({type:'application/vnd.api+json'}));
    app.use(methodOverride());    

    mongoose.connect("mongodb://localhost:27017/NodeApi");
 
    var Resource = app.resource = restful.model('Book', mongoose.Schema(dbSchema), 'Book')
                    .methods(['get', 'post', 'put', 'delete']);

    var allowMethods = function (req, res, next) {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    }

    Resource.register(app, '/books');







    app.route('/about')
        .get(controller.about);
    app.route('/distance/:zipcode1/:zipcode2')
        .get(controller.get_distance);
};