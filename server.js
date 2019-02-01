var express = require('express')
var app = express();
var port = process.env.PORT || 3000;

var routesHandler = require('./routes/routes.handler');

routesHandler(app);
app.listen(port, function() {
   console.log('Server started on port: ' + port);
});