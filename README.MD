RESTful API backend

1. This module enables an API to maintain objects in the main database (mongoDB)
1. It must be able to be dockerized
1. It will be deployed as a microservice on K8S in the production phase

- Developed using Typescript and MEAN
- Makes use of mongo db schemas to ensure structure and validation
- Makes use of mongoose to access the database
- Makes use of node-restful to create routes

Version 1.0

- Authentication is provided in the form of system tokens (known client systems) using a collection of authorised systems
- Real users performing the operations are identified using IDs called collaborator_id, and are sent as data for now
- Schemas for each collection are stored in a mongodb collection called "schemas".
- Some Collections are exposed to the API (i.e. can be manipulated by the API) and others are invisible (internal)
- Nested schemas are not supported in this version
- Security is not provided in this version
- Audit log is implemented storing each operation, failed or not, aong with the collaborator that attempted it
- Controllers are generic, with collection name extracted from the URL path

Roadmap - Version 1.1

- Added security in the form of roles, CRUD rules and recordsets.

---

## Post Install Set up

**After npm install run this command line:**

```sh
npx patch-package
```

---

## .env File

**You must create or have a .env file with this configuration:**

```sh
NODE_ENV=development
PORT=3000
RESTFUL_API_PUBLIC_PORT=3200
MONGO_URL=mongodb://mongodbs:27017/NodeAPI
MONGO_URL_TEST=mongodb://mongodbs:27017/NodeAPI_test
WEBAPINAME=webapi
VERSION=1.0

COLLECTIONS_SCHEMAS=collections_schemas
COLLECTION_NAME=collection_name
AUDIT_LOG=audit_log
SYSTEM_TOKENS=system_tokens"
```

## Commands

All commands are under a make file to have everything centralized. The available commands are:

```shell
    #install all npm dependences
    make install

    #Build all docker files present on docker-compose.yml
    make build

    #Run the API REST
    make up

    #Install package
    make install-<package>

    #install dev package
    make install-dev-<package>

    #Run lint
    make lint

    #Run unit test
    make unittest

    #Compile
    make tsc

```

## Installation

To develop in local environment:

```shell
git https://github.com/elefantelimpio/NodeAPI.git
cd NodeAPI
git checkout develop
make install
make build
make up
```

---

## Set Up Documentation

**First, go to apidoc directory:**

```sh
cd apidoc
```

**If you haven't installed apidoc yet then run:**

```sh
npm install apidoc -g
```

**Then run apidoc in console:**

```sh
apidoc
```

Now you should have a _doc_ folder insidide _apidoc_ folder. Then you can open index.html and see the documentation

---

## Database Requirements

**You must create a collection called "collections_schemas"** Each document of this collection must contains two fields:

1. **collection_name (string)** Name of a collection from our database
2. **collection_schema (string)** An object that represents the schema of the collection. It will be a [Mongoose schema] not mongodb schema style

[mongoose schema]: https://mongoosejs.com/docs/guide.html

**Remember to use double quotes, it's strictly necessary**
_Example:_

```sh
{
    "_id": ObjectId("5d0220ae1c9d440000446076"),
    "collection_name": "collaborators",
    "collection_schema": "{ \"_id\": \"ObjectId\", \"name\": \"String\", \"roles\": [{ \"type\": \"ObjectId\", \"ref\": \"roles\" }]}"
}
```

This document represent **collaborators** entity. If you look at _collection_schema_ field you will see that _roles_ is a relationship field. According to **mongoose** documentation https://mongoosejs.com/docs/populate.html you can specify a relationship between entities using _population_

The API use a custom mapper which maps the field types you specify in _collection_schema_ field to mongoose schema types:

```sh
'String': Schema.Types.String,
'Date': Schema.Types.Date,
'Number': Schema.Types.Number,
'Boolean': Schema.Types.Boolean,
'ObjectId': Schema.Types.ObjectId,
'Buffer': Schema.Types.Buffer,
'Mixed': Schema.Types.Mixed,
'Array': Schema.Types.Array,
'Decimal128': Schema.Types.Decimal128
```

**You must also have a collection called "system_tokens" in your MongoDB Database** The api use this collection to authorize each request. This collection must contains 2 fields:

1. **name (string)** A name that describes this token
2. **system_token (string)** Any kind of authorization token you want to use.

_Example:_

```sh
{
    "name": "development",
    "collection_schema": "MLwnbMfVskkFB$HrC<S6Wkf<_'^z)gl0a5=^cr!@;NApu:_.qPIM`V'H!tGK.?["
}
```

---

## **Version 1.1**

## Set Up Permssions

---

## Database Requirements

**You must create two collectionn:"roles" and "permissions"**

1. **roles** This collection represents entity _"roles"_. This entity contains a descriptive name and a list of permissions, this permissions must exist in _"permissions"_ collection

```sh
{
    "_id":"5d01f64d20e109206cb1112c",
    "name":"programming_books",
    "permissions":[
        ObjectId("5d01f391ea7ac0206cacf8db"),
        ObjectId("5d0902cb1c9d440000d5585a"),
        ObjectId("5d10722779acd110e0979188"),
        ObjectId("5d10724479acd110e0979189")]
}
```

2. **permissions** This collection represents _"permissions"_ entity. This must contains these fields:
   2.1. **name** Descriptive name that represents what the permission does
   2.2. **collection_name** The collection which this permission will be applied
   2.3. **operation** The operation (find, updpdate, insert or delete)
   2.4. **filter** Mongodb filter, this filter will be applied to each operation to verify if the user can do the requested action

_Update permission restricted by topic field_

```sh
{
    "_id": ObjectId("5d01f391ea7ac0206cacf8db"),
    "name": "insert_programming_book",
    "collection_name": "books",
    "operation": "insert",
    "filter": "{\"topic\": {\"$eq\": \"programming\"}}"
}
```

_Find permission without restriction_

```sh
{
    "_id": ObjectId("5d08fc3b1c9d440000d55859"),
    "name": "find_all_books",
    "collection_name": "books",
    "operation": "find",
    "filter": ""
}
```
