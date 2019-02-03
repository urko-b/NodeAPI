var express = require('express')
var routesHandler = require('../api/routes.handler');
var app = express();
var port = process.env.PORT || 3000;




routesHandler(app);
app.listen(port, function() {
   console.log('Server started on port: ' + port);
});