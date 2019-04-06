RESTful API for 7sense backend

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

[Mongoose schema]: https://mongoosejs.com/docs/guide.html

**Remember to use double quotes, it's strictly necessary**
*Example:* 
```sh
{   
    "collection_name": "crag", 
    "collection_schema": "{"name":{"type":"string","required":true,"unique":true},"description":{"type":"string","required":true},"sectors":[{"name":{"type":"string"},"routes":[{}]}],"location":{"type":"Object","structure":{" latitude":{"type":"number","required":true},"longitude":{"type":"number","required":true}},"required":true}}"
}
```

**You must also have a collection called "system_tokens" in your MongoDB Database** The api use this collection to authorize each request. This collection must contains 2 fields:

1. **name (string)** A name that describes this token
2. **system_token (string)** Any kind of authorization token you want to use.

*Example:* 
```sh
{   
    "name": "development", 
    "collection_schema": "MLwnbMfVskkFB$HrC<S6Wkf<_'^z)gl0a5=^cr!@;NApu:_.qPIM`V'H!tGK.?["
}
```

