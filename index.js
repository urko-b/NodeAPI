'use strict'

const mongoose = require('mongoose')
const app = require('./app')
const config = require('./config-module.js').config();


mongoose.connect(`${config.CLUSTER}`, (err, res) => {
    if (err) {
        return console.log(`Error al conectar a la base de datos: ${err}`)
    }
    console.log('Conexión a la base de datos establecida...')

    app.listen(config.PORT, () => {
        console.log(`API REST corriendo en http://localhost:${config.PORT}`)
    });
});