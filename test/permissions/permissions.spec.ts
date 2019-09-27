import * as chai from 'chai';
import 'mocha';
import * as mongoose from 'mongoose';
import { Permissions } from '../../permissions/permissions';
import { PermissionsHelper } from './permissions.helper';



describe('Testing permissions', () => {
  let permissions = [
    PermissionsHelper.permissions.find,
    PermissionsHelper.permissions.insert,
    PermissionsHelper.permissions.update,
    PermissionsHelper.permissions.delete
  ];
  let collaborator = {};
  let rol = {};
  before(async () => {
    PermissionsHelper.addPermissionsModels();
    permissions = await mongoose.connection.models.permissions.insertMany(permissions);

    rol = {
      name: 'test_rol',
      permissions: permissions.map(p => p['_id'])
    };
    rol = await new mongoose.connection.models.roles(rol).save();
    collaborator = {
      'name': 'collaborator-test',
      'roles': [rol['_id']]
    };
    collaborator = await new mongoose.connection.models.collaborators(collaborator).save();
  });

  after(async () => {
    await mongoose.connection.models.permissions.deleteMany({ 'collection_name': { '$eq': 'test_collection' } });
    await mongoose.connection.models.roles.findByIdAndDelete(rol['_id']);
    await mongoose.connection.models.collaborators.findByIdAndDelete(collaborator['_id']);
  });

  describe('getPermissions()', () => {
    it('should get find permisions', async () => {
      const collaboratorId: mongoose.Types.ObjectId = collaborator['_id'];
      const testPermissions = await Permissions.getPermissions(collaboratorId, 'test_collection', 'find');
      chai.assert(
        chai.expect(testPermissions).to.be.eql([PermissionsHelper.permissions.find.filter])
      );
    });

    it('should return empty', async () => {
      const collaboratorId = new mongoose.Types.ObjectId();
      const emptyPermissions = await Permissions.getPermissions(collaboratorId, 'test_collection', 'find');
      chai.assert(
        chai.expect(emptyPermissions).to.be.eql([])
      );
    });
  });

  describe('getOperationByMethodName()', () => {
    it('GET request should be "find"', async () => {
      const operationName = await Permissions.getOperationByMethodName('GET');
      chai.assert(
        chai.expect(operationName).to.be.eql(PermissionsHelper.permissions.find.operation)
      );
    });

    it('POST request should be "insert"', async () => {
      const operationName = await Permissions.getOperationByMethodName('POST');
      chai.assert(
        chai.expect(operationName).to.be.eql(PermissionsHelper.permissions.insert.operation)
      );
    });

    it('PATCH request should be "update"', async () => {
      const operationName = await Permissions.getOperationByMethodName('PATCH');
      chai.assert(
        chai.expect(operationName).to.be.eql(PermissionsHelper.permissions.update.operation)
      );
    });


    it('DELETE request should be "delete"', async () => {
      const operationName = await Permissions.getOperationByMethodName('DELETE');
      chai.assert(
        chai.expect(operationName).to.be.eql(PermissionsHelper.permissions.delete.operation)
      );
    });
  });
});
