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

## Database Requirements

**You must create a collection called "collections_schemas"** Each document of this collection must contains two fields:

1. **collection_name (string)** Name of a collection from our database
2. **collection_schema (string)** An object that represents the schema of the collection. It will be a Mongoose schema not mongodb schema style
