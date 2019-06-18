import { connection } from 'mongoose';
import { ObjectId } from 'bson';
import { OperationsMapper } from './operations-mapper';

export class Permissions {
  public static async getListByCollaborator(collaborator_id: ObjectId) {
    try {
      const collaborators = connection.models.collaborators;
      const collaboratorPermissions = await collaborators.findOne({ '_id': collaborator_id }).populate({ path: 'roles', populate: { path: 'permissions' } });
      return collaboratorPermissions;
    } catch (e) {
      console.error(e);
    }
  }

  public static async getPermissions(collaboratorId: ObjectId, collectionName: string, operation: string) {
    try {
      const collaborators = connection.models.collaborators;
      const collaboratorPopulated = await collaborators.findOne({ '_id': collaboratorId })
        .populate({ path: 'roles', populate: { path: 'permissions', match: { 'collection_name': collectionName, 'operation': operation } } });

      const roles: [] = collaboratorPopulated.roles;
      let permissions = [];
      roles.forEach((rol: any) => {
        if (rol.permissions.length > 0) {
          permissions = permissions.concat(rol.permissions.map(r => r.filter));
        }
      });

      return permissions;
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  public static getOperationByMethodName(method: string) {
    return OperationsMapper[method];
  }

}
