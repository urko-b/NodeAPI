'use strict';

var express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    morgan = require('morgan'),
    restful = require('node-restful'),
    mongoose = restful.mongoose;

var environment = require('../config-module.js').config();



var schemaWithId = require('../schema-without-id.json');
var dbSchema = require('../schema.json');
var ObjectId = require('mongoose').Types.ObjectId;

module.exports = function (app) {
    app.use(morgan('dev'));
    app.use(bodyParser.urlencoded({ 'extended': 'true' }));
    app.use(bodyParser.json());
    app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
    app.use(methodOverride());

    mongoose.connect(`${environment.CLUSTER}`);

    var book = app.book = restful.model('book', mongoose.Schema(dbSchema.Book), 'book')
        .methods(['get', 'post', 'put', 'delete'])
        .updateOptions({ new: true });

    var crag = app.crag = restful.model('crag', mongoose.Schema(dbSchema.Crag), 'crag')
        .methods(['get', 'post', 'put', 'delete'])
        .updateOptions({ new: true });

    var allowMethods = function (req, res, next) {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    }

    book.register(app, `/webapi/${environment.VERSION}/book`);
    crag.register(app, `/webapi/${environment.VERSION}/crag`);

    app.patch(`/webapi/${environment.VERSION}/book/:id`, function (req, res) {
        var updateObject = req.body;
        var id = new ObjectId(req.params.id);
        app.book.findOneAndUpdate({ _id: id }, updateObject, { new: true, runValidators: true }, (err, book) => {

            if (err) {
                return res.status(400).send({ msg: 'Update failed!' });
            }
            return res.status(200).send(book);
        });
    });

};