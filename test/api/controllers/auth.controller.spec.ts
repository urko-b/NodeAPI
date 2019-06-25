import * as chai from 'chai';
import 'mocha';
import * as mongoose from 'mongoose';
import { AuthController } from '../../../api/controllers/auth.controller';
import { TestHelper } from '../../test.module';

describe('Testing auth.controller', () => {
  it('init(): should add system_tokens to mongoose models', done => {
    const authController = new AuthController();
    authController.init();

    chai.assert(
      chai.expect(mongoose.connection.models.system_tokens).not.be.undefined
    );
    done();
  });

  it('isTokenValid(): ', async () => {
    TestHelper.removeMongooseModels();
    const tokenId = new mongoose.Types.ObjectId();
    const authController = new AuthController();
    authController.init();

    const token = { name: '', system_token: tokenId };
    await mongoose.connection.models.system_tokens.insertMany([token]);

    // Check if its valid
    const isTokenValid = await authController.isTokenValid(tokenId.toString());
    // Remove that token
    await mongoose.connection.models.system_tokens.findOneAndDelete({
      system_token: { $eq: tokenId }
    });

    return chai.assert(chai.expect(isTokenValid).is.true);
  });

  it('tokenExists(): Should return true, token received is not null or undefined', async () => {
    const tokenId = new mongoose.Types.ObjectId();
    const authController = new AuthController();

    const tokenExists: boolean = authController.tokenExists(tokenId);
    return chai.assert(chai.expect(tokenExists).is.true);
  });

  it('tokenExists(): Should return false, Token received is null', async () => {
    const authController = new AuthController();

    const tokenExists: boolean = authController.tokenExists(null);
    return chai.assert(chai.expect(tokenExists).is.false);
  });
});
