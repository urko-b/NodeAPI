import * as chai from 'chai';
import chaiHttp = require('chai-http');
import * as dotenv from 'dotenv';
import * as i18n from 'i18n';
import 'mocha';
import { connection, model, Schema, SchemaDefinition, Types } from 'mongoose';
import * as supertest from 'supertest';
import { PatchHandler } from '../../api/patch.handler';
import { App } from '../../app';

import bodyParser = require('body-parser');
import { JsonPatchError } from 'fast-json-patch';
import { TestHelper } from '../test.module';
import { Server } from 'http';

chai.use(chaiHttp);
dotenv.config();

describe('Testing patch.handler', () => {

  let webApi: App;
  const bookCollection = 'book';
  let patchHandler: PatchHandler;

  const cleanCodeBook = {
    author: {
      name: 'Robert',
      surname: 'C. Martin'
    },
    title: 'Clean code',
    description:
      'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees'
  };

  const initi18n = () => {
    i18n.configure({
      cookie: 'language-cookie',
      directory: __dirname + '/locales',
      locales: ['en', 'es', 'fr', 'es', 'pt', 'de']
    });
  };

  const prepareWebApi = () => {
    webApi = new App(process.env.PORT);
    webApi.app.use(bodyParser.urlencoded({ extended: true }));
    webApi.app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
    webApi.app.use(bodyParser.json({ type: 'application/json-patch' }));
    webApi.app.use(bodyParser.json());
    initi18n();
    webApi.app.use(i18n.init);

  };


  const prepareMongooseModel = () => {
    const bookSchema: SchemaDefinition = { author: {}, description: String, title: String };
    const mongooseSchema = new Schema(bookSchema);
    model(bookCollection, mongooseSchema, bookCollection);
  };

  const registerPatch = () => {
    patchHandler = new PatchHandler(
      webApi.app,
      `/${bookCollection}`,
      bookCollection
    );
    patchHandler.registerPatch();
  };

  const prepareForTestPatchHandler = () => {
    prepareWebApi();

    prepareMongooseModel();

    registerPatch();
  };


  describe('registerPatch():', () => {
    let request: supertest.SuperTest<any>;
    before(async () => {
      TestHelper.removeMongooseModels();

      prepareWebApi();
      prepareMongooseModel();
      registerPatch();

      request = supertest(webApi.app);

      insertedBook = await connection.models.book.insertMany([cleanCodeBook]);
      insertedBookId = insertedBook[0]._id;
    });

    let insertedBookId = '';
    let insertedBook = {};
    it('Should update book book inserted', async () => {
      await request.patch(`/${bookCollection}/${insertedBookId}`)
        .set('language-cookie', 'en')
        .set('content-type', 'application/json-patch')
        .send('[{"op": "replace", "path": "/title", "value": "newTitle"}]')
        .expect(200);
    });

    it('Should return 404, invalid documentId', async () => {
      await request.patch(`/${bookCollection}/12321312`)
        .set('language-cookie', 'en')
        .set('content-type', 'application/json-patch')
        .send('[{"op": "replace", "path": "/title", "value": "newTitle"}]')
        .expect(404);
    });

    it('Should return 404, book not found', async () => {
      await request.patch(`/${bookCollection}/000000000000000000000000`)
        .set('language-cookie', 'en')
        .set('content-type', 'application/json-patch')
        .send('[{"op": "replace", "path": "/title", "value": "newTitle"}]')
        .expect(404);
    });



    it('Should return 400, Invalid patch', async () => {
      await request
          .patch(`/${bookCollection}/${insertedBookId}`)
          .set('language-cookie', 'en')
          .set('content-type', 'application/json-patch')
          .send('[{"op": "replace", "path": "/aatle", "value": "newTitle"}]')
          .expect(400);
    });
    after(async () => {
      await connection.models.book.findOneAndDelete({
        _id: { $eq: insertedBookId }
      });
    });
  });

  describe('patch.handler methods', () => {
    before(() => {
      TestHelper.removeMongooseModels();
      prepareForTestPatchHandler();
    });

    describe('getDocument():', () => {
      it('Should get inserted Document', async () => {
        const insertedBook = await connection.models.book.insertMany([cleanCodeBook]);
        const bookId = insertedBook[0]._id;

        const book = patchHandler.getDocument(bookId);
        await connection.models.book.findOneAndDelete({ '_id': { '$eq': bookId } });

        chai.assert(chai.expect(book).not.to.be.undefined.and.not.to.be.null);
      });
    });

    describe('documentExists()', () => {
      it('Should get a document and verify it exits', async () => {
        const insertedBook = await connection.models.book.insertMany([cleanCodeBook]);
        const bookId = insertedBook[0]._id;

        const book = await connection.models.book.findOne({ '_id': { '$eq': bookId } });

        const documentExists = patchHandler.documentExists(book);
        await connection.models.book.findOneAndDelete({ '_id': { '$eq': bookId } });

        chai.assert(chai.expect(documentExists).is.true);
      });

      it('Should get a document and verify it does not exits', async () => {
        const bookId = Types.ObjectId('000000000000000000000000');

        const book = await connection.models.book.findOne({ '_id': { '$eq': bookId } });
        const documentExists = patchHandler.documentExists(book);
        chai.assert(chai.expect(documentExists).is.false);
      });
    });


    describe('isValidPatch():', () => {
      it('Should verify JsonPatchError received is not undefined', async () => {
        const patchErrors: JsonPatchError = new JsonPatchError('Error', 'OPERATION_OP_INVALID');
        const isValidPatch = patchHandler.isValidPatch(patchErrors);
        chai.assert(chai.expect(isValidPatch).is.false);
      });

      it('Should verify JsonPatchError received is undefined', async () => {
        const isValidPatch = patchHandler.isValidPatch(undefined);
        chai.assert(chai.expect(isValidPatch).is.true);
      });
    });

    describe('getPatchedDocument():', () => {
      it('Should apply JsonPatchOperations and get document patched', async () => {
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
    });

    describe('updateDocument():', () => {
      it('Should update document with JsonPatchOperations received', async () => {
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
});

