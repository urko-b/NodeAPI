'use strict';

const schm = require('schm');
const config = require('../config-module.js').config();
const apiRoute = `/${config.WEBAPINAME}/${config.VERSION}`;

const crag = 'crag';
const book = 'book';

var routeSchema = new schm({
    resource: String,
    methods: [],
    strict: Object,
    model: String,
    routeName: String,
    updateOptions: Object
});

module.exports = {
    routeSchema: function () {
        return routeSchema;
    },
    routes: [
        routeSchema.parse({
            resource: book,
            methods: ['get', 'post', 'put', 'patch', 'delete'],
            model: book,            
            routeName: `${apiRoute}/${book}`,
            updateOptions: { new: true }
        }),
        routeSchema.parse({
            resource: crag,
            methods: ['get', 'post', 'put', 'patch', 'delete'],
            model: crag,
            routeName: `${apiRoute}/${crag}`,
            updateOptions: { new: true }
         })
    ]
}