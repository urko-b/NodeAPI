'use strict'

const mongoose = require('mongoose')
const app = require('./app')
const config = require('./config-module.js').config();
var url = `mongodb://mongo:27018/NodeAPI`;
var options = { useMongoClient: true };
var port = config.PORT || 3000;
url = "mongodb://ksilophone:C0u5c0u50123@cluster0-shard-00-01-7dio0.mongodb.net:27017/NodeApi?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin";
mongoose.connect(url, (err, res) => {
    if (err) {
        return console.log(`Error al conectar a la base de datos: ${err}`)
    }
    console.log('Conexión a la base de datos establecida...')

    app.listen(port, () => {
        console.log(`API REST corriendo en http://localhost:${port}`)
    });
});