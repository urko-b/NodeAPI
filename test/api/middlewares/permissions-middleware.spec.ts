import * as chai from 'chai';
import * as mongoose from 'mongoose';
import { PermissionsMidleware } from '../../../api/middlewares/permissions-middleware';
import { TestHelper } from '../../test.helper';
import { PermissionsHelper } from '../../permissions/permissions.helper';


describe('Testing permissions-middleware', () => {

  const next = () => null;
  const res = {
    status: () => {
      return {
        send: () => null
      };
    }
  };
  describe('canIDo():', () => {

    let collaborator = {};
    let noPermissionsCollaborator = {};
    let rol = {};
    let permissions = [
      PermissionsHelper.permissions.find,
      PermissionsHelper.permissions.insert,
      PermissionsHelper.permissions.update,
      PermissionsHelper.permissions.delete
    ];

    const preparePermissions = async () => {
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

      const noPermisison = await new mongoose.connection.models.permissions({ 'name': 'no_permission', 'colleciton_name': 'test_collection', 'operation': 'find', 'filter': '"{testing: null}"' }).save();
      const noPermissionRol = await new mongoose.connection.models.roles({ 'name': 'no permissions', permissions: [noPermisison['_id']] }).save();
      noPermissionsCollaborator = await new mongoose.connection.models.collaborators({ 'name': 'noPermisisons', roles: [noPermissionRol['_id']] }).save();
    };

    const prepareTestCollection = async () => {
      const testCollectionSchema = new mongoose.Schema({
        name: mongoose.Schema.Types.String,
        testing: mongoose.Schema.Types.Boolean
      });
      mongoose.model('test_collection', testCollectionSchema, 'test_collection');

      await mongoose.connection.models.test_collection.insertMany([
        {
          'testing': true,
        },
        {
          'testing': false,
        }
      ]);
    };

    before(async () => {
      TestHelper.removeMongooseModels();
      await preparePermissions();
      await prepareTestCollection();
    });

    const url = 'http://localhost:3000/test_collection';

    describe('GET method', () => {
      it(`req.findBy should be $or mongodb query with "${PermissionsHelper.permissions.find.filter}"`, async () => {
        const req = {
          header: (key) => {
            return collaborator['_id'];
          },
          url,
          method: 'GET',
          findBy: {}
        };
        await PermissionsMidleware.canIDo(req, res, next);

        const filter = JSON.parse(PermissionsHelper.permissions.find.filter);
        const canIDoFilter = {
          '$or': [filter]
        };
        chai.assert(
          chai.expect(req.findBy).to.be.eql(canIDoFilter)
        );
      });

      it('req.findBy should be empty object, no permissions', async () => {
        const req = {
          header: (key) => {
            return noPermissionsCollaborator['_id'];
          },
          url,
          method: 'GET',
          findBy: {}
        };
        await PermissionsMidleware.canIDo(req, res, next);
        chai.assert(
          chai.expect(req.findBy).to.be.eql({})
        );
      });

      it('req.findBy should be empty object, request is SyncSchema', async () => {
        const req = {
          header: (key) => {
            return noPermissionsCollaborator['_id'];
          },
          url: '/SyncSchema',
          method: 'GET',
          findBy: {}
        };
        await PermissionsMidleware.canIDo(req, res, next);
        chai.assert(
          chai.expect(req.findBy).to.be.eql({})
        );
      });


      it('req.findBy should be empty object, request is SyncSchema', async () => {
        const req = {
          header: (key) => {
            return noPermissionsCollaborator['_id'];
          },
          url,
          method: 'GET',
          findBy: {}
        };
        await PermissionsMidleware.canIDo(req, res, next);
        chai.assert(
          chai.expect(req.findBy).to.be.eql({})
        );
      });


      it(`req.findBy should be empty, no documents found "${PermissionsHelper.permissions.find.filter}"`, async () => {
        await mongoose.connection.models.permissions.deleteMany({ 'collection_name': { '$eq': 'test_collection' } });
        const req = {
          header: (key) => {
            return collaborator['_id'];
          },
          url,
          method: 'GET',
          findBy: {}
        };
        await PermissionsMidleware.canIDo(req, res, next);

        chai.assert(
          chai.expect(req.findBy).to.be.eql({})
        );
      });
    });

    after(async () => {
      await mongoose.connection.models.permissions.deleteMany({ 'collection_name': { '$eq': 'test_collection' } });
      await mongoose.connection.models.roles.findByIdAndDelete(rol['_id']);
      await mongoose.connection.models.collaborators.findByIdAndDelete(collaborator['_id']);
      await mongoose.connection.models.test_collection.deleteMany({});
    });
  });
});
