'use strict';

const schm = require('schm');
const config = require('../config-module.js').config();

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
            resource: 'book',
            methods: ['get', 'post', 'put', 'delete'],
            model: 'book',            
            routeName: `/${config.WEBAPINAME}/${config.VERSION}/book`,
            updateOptions: { new: true }
        }),
        routeSchema.parse({
            resource: 'crag',
            methods: ['get', 'post', 'put', 'patch', 'delete'],
            model: 'crag',
            routeName: `/${config.WEBAPINAME}/${config.VERSION}/crag`,
            updateOptions: { new: true }
         })
    ]
}