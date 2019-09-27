
import * as mongoose from 'mongoose';

export class PermissionsHelper {
  public static permissions = {
    find: {
      'name': 'test_find_permission',
      'collection_name': 'test_collection',
      'operation': 'find',
      'filter': '{"testing": {"$eq": true}}'
    },
    insert: {
      'name': 'test_insert_permission',
      'collection_name': 'test_collection',
      'operation': 'insert',
      'filter': '{"testing": {"$eq": true}}'
    },
    update: {
      'name': 'test_update_permission',
      'collection_name': 'test_collection',
      'operation': 'update',
      'filter': '{"testing": {"$eq": true}}'
    },
    delete: {
      'name': 'test_delete_permission',
      'collection_name': 'test_collection',
      'operation': 'delete',
      'filter': '{"testing": {"$eq": true}}'
    }
  };


  public static addPermissionsModels() {
    const permissionsSchema = new mongoose.Schema({
      title: mongoose.Schema.Types.String,
      collection_name: mongoose.Schema.Types.String,
      operation: mongoose.Schema.Types.String,
      filter: mongoose.Schema.Types.String
    });

    const rolesSchema = new mongoose.Schema({
      name: mongoose.Schema.Types.String,
      permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'permissions' }]
    });

    const collaboratorsSchema = new mongoose.Schema({
      name: mongoose.Schema.Types.String,
      roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'roles' }]
    });

    mongoose.model('permissions', permissionsSchema, 'permissions');
    mongoose.model('roles', rolesSchema, 'roles');
    mongoose.model('collaborators', collaboratorsSchema, 'collaborators');
  }
}
