var express = require('express')
var registerRoutes = require('./api/routes.handler');
var app = express();
var port = process.env.PORT || 3000;

var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var morgan = require('morgan');


app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ 'extended': 'true' }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());


registerRoutes(app);

module.exports = app;