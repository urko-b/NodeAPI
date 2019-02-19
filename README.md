RESTful API for 7sense backend

This module enables an API to maintain objects in the main database (mongoDB)
It must be able to be dockerized
It will be deployed as a microservice on K8S in the production phase


Developed using Typescript and MEAN
Makes use of mongo db schemas to ensure structure and validation
Makes use of mongoose to access the database
Makes use of node-restful to create routes

Version 1.0
Authentication is provided in the form of system tokens (known client systems) using a collection of authorised systems
Real users performing the operations are identified using IDs called collaborator_id, and are sent as data for now 
Schemas for each collection are stored in a mongodb collection called "schemas". 
Some Collections are exposed to the API (i.e. can be manipulated by the API) and others are invisible (internal) 
Nested schemas are not supported in this version
Security is not provided in this version
Audit log is implemented storing each operation, failed or not, aong with the collaborator that attempted it
Controllers are generic, with collection name extracted from the URL path

Roadmap - Version 1.1
Added security in the form of roles, CRUD rules and recordsets.
