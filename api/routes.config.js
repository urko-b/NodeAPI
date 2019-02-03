'use strict';

var schm = require('schm');
var routeSchema = new schm({
    resource: String,
    methods: [],
    strict: Object,
    model: String,
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
            updateOptions: { new: true }
        }),
        routeSchema.parse({
            resource: 'crag',
            methods: ['get', 'post', 'put', 'patch', 'delete'],
            model: 'crag',
            updateOptions: { new: true }
         })
    ]
}