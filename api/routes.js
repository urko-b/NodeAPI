'use strict';

var express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    morgan = require('morgan'),
    restful = require('node-restful'),
    mongoose = restful.mongoose;

var schemaWithId = require('../schema-without-id.json');
var dbSchema = require('../schema.json');
var ObjectId = require('mongoose').Types.ObjectId;

module.exports = function (app) {
    app.use(morgan('dev'));
    app.use(bodyParser.urlencoded({ 'extended': 'true' }));
    app.use(bodyParser.json());
    app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
    app.use(methodOverride());

    mongoose.connect("mongodb://ksilophone:Q1ckgr1nd3r" +
    "@cluster0-shard-00-01-7dio0.mongodb.net:27017/NodeApi?replicaSet=Cluster0-shard-0&authSource=admin");

    var book = app.book = restful.model('Book', mongoose.Schema(dbSchema.Book), 'Book')
        .methods(['get', 'post', 'put', 'delete'])
        .updateOptions({ new: true });

    var crag = app.crag = restful.model('Crag', mongoose.Schema(dbSchema.Crag), 'Crag')
        .methods(['get', 'post', 'put', 'delete'])
        .updateOptions({ new: true });

    var allowMethods = function (req, res, next) {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    }

    book.register(app, '/book');
    crag.register(app, '/crag');

    app.patch('/book/:id', function (req, res) {
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