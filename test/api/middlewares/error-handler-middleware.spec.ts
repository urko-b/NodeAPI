import * as chai from 'chai';
import 'mocha';
import * as mongoose from 'mongoose';
import { AuthController } from '../../../api/controllers/auth.controller';
import { TestHelper } from '../../test.module';

import { ErrorHandler } from '../../../api/middlewares/error-handler-middleware';

describe('error-handler-middleware.ts', () => {
  describe('ErrorHandler', () => {
    const next = () => null;
    const req = {};
    const err = {};
    describe('handleError()', () => {
      it('should next(), res.headersSent is true', (done) => {
        const res = { headersSent: true };
        ErrorHandler.handleError(err, req, res, next);

        done();
      });
      it('res.headerSent should res.send(), res.headersSent is false', (done) => {
        const res = {
          headersSent: false,
          send: () => null
        };
        ErrorHandler.handleError(err, req, res, next);

        done();
      });
    });
  });
});
