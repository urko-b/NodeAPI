import * as chai from 'chai';
import chaiHttp = require('chai-http');
import * as dotenv from 'dotenv';
import 'mocha';
import { connection, model, Schema, SchemaDefinition, Types } from 'mongoose';
import * as supertest from 'supertest';
import { PatchHandler } from '../../api/patch.handler';
import { App } from '../../app';

import bodyParser = require('body-parser');
import { TestHelper } from '../test.module';
import { JsonPatchError } from 'fast-json-patch';

describe('Testing patch.handler', () => {

  describe('PatchHandler', () => {
    const cleanCodeBook = {
      author: {
        name: 'Robert',
        surname: 'C. Martin'
      },
      title: 'Clean code',
      description:
        'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees'
    };

    chai.use(chaiHttp);
    dotenv.config();

    let webApi: App;
    const bookCollection = 'book';
    let patchHandler: PatchHandler;

    beforeEach(() => {
      TestHelper.removeMongooseModels();

      webApi = new App(process.env.PORT);
      webApi.app.use(bodyParser.urlencoded({ extended: true }));
      webApi.app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
      webApi.app.use(bodyParser.json({ type: 'application/json-patch' }));
      webApi.app.use(bodyParser.json());


      const bookSchema: SchemaDefinition = { author: {}, description: String, title: String };
      const mongooseSchema = new Schema(bookSchema);
      model(bookCollection, mongooseSchema, bookCollection);

      patchHandler = new PatchHandler(
        webApi.app,
        bookCollection,
        bookCollection
      );
      patchHandler.registerPatch();
    });

    it('registerPatch(): Should register PATCH route for book entity and test patch request after register route', async () => {
      let insertedBookId = '';

      try {


        const insertedBook = await connection.models.book.insertMany([cleanCodeBook]);
        insertedBookId = insertedBook[0]._id;

        supertest(webApi.app)
          .patch(`/${bookCollection}/${insertedBookId}`)
          .set('content-type', 'application/json')
          .send('[{"op": "replace", "path": "/title", "value": "newTitle"}]')
          .expect(200);
      } finally {
        await connection.models.book.findOneAndDelete({
          _id: { $eq: insertedBookId }
        });
      }
    });

    it('getDocument(): Should get inserted Document', async () => {
      const insertedBook = await connection.models.book.insertMany([cleanCodeBook]);
      const bookId = insertedBook[0]._id;

      const book = patchHandler.getDocument(bookId);
      await connection.models.book.findOneAndDelete({ '_id': { '$eq': bookId } });

      chai.assert(chai.expect(book).not.to.be.undefined.and.not.to.be.null);
    });

    it('documentExists(): Should get a document and verify it exits', async () => {

      const insertedBook = await connection.models.book.insertMany([cleanCodeBook]);
      const bookId = insertedBook[0]._id;

      const book = await connection.models.book.findOne({ '_id': { '$eq': bookId } });

      const documentExists = patchHandler.documentExists(book);
      await connection.models.book.findOneAndDelete({ '_id': { '$eq': bookId } });

      chai.assert(chai.expect(documentExists).is.true);
    });

    it('documentExists(): Should get a document and verify it does not exits', async () => {
      const bookId = Types.ObjectId('000000000000000000000000');

      const book = await connection.models.book.findOne({ '_id': { '$eq': bookId } });
      const documentExists = patchHandler.documentExists(book);
      chai.assert(chai.expect(documentExists).is.false);
    });

    it('isValidPatch(): Should verify JsonPatchError received is not undefined', async () => {
      const patchErrors: JsonPatchError = new JsonPatchError('Error', 'OPERATION_OP_INVALID');
      const isValidPatch = patchHandler.isValidPatch(patchErrors);
      chai.assert(chai.expect(isValidPatch).is.false);
    });

    it('isValidPatch(): Should verify JsonPatchError received is undefined', async () => {
      const isValidPatch = patchHandler.isValidPatch(undefined);
      chai.assert(chai.expect(isValidPatch).is.true);
    });

    it('getPatchedDocument(): Should apply JsonPatchOperations and get document patched', async () => {
      const bookToPatch = {
        title: 'Clean code',
        description:
          'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees'
      };

      const jsonPatchOperations = [{ 'op': 'replace', 'path': '/title', 'value': 'newTitle' }];

      const newDocument = {
        title: 'newTitle',
        description:
          'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees'
      };

      const documentPatched = patchHandler.getPatchedDocument(bookToPatch, jsonPatchOperations);
      chai.assert(chai.expect(documentPatched.newDocument).to.deep.equal(newDocument));
    });

    it('updateDocument(): Should update document with JsonPatchOperations received', async () => {
      const patchedDocument = {
        newDocument: {
          author: {
            name: 'Robert',
            surname: 'C. Martin'
          },
          title: 'newTitle',
          description:
            'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees'
        }
      };

      const insertedBook = await connection.models.book.insertMany([cleanCodeBook]);
      const bookId = Types.ObjectId(insertedBook[0]._id);

      const updatedDocument = await patchHandler.updateDocument(bookId, patchedDocument);
      await connection.models.book.findOneAndDelete({ '_id': { '$eq': bookId } });

      chai.assert(chai.expect(updatedDocument.nModified).equals(1));
    });
  });
});

