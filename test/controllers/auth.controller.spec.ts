import * as chai from 'chai';
import 'mocha';
import * as mongoose from 'mongoose';
import { AuthController } from '../../controllers/auth.controller';
import { TestHelper } from '../test.module';

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
});
