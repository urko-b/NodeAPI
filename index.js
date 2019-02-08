'use strict'

const mongoose = require('mongoose')
const app = require('./app')
const config = require('./config-module.js').config();
const url = `mongodb://mongo:27018/NodeAPI`;
var options = { useMongoClient: true };
var port = config.PORT || 3000;
mongoose.connect(url, (err, res) => {
    if (err) {
        return console.log(`Error al conectar a la base de datos: ${err}`)
    }
    console.log('Conexión a la base de datos establecida...')

    app.listen(port, () => {
        console.log(`API REST corriendo en http://localhost:${port}`)
    });
});