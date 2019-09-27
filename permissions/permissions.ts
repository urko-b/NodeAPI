import { connection } from 'mongoose';
import { ObjectId } from 'bson';
import { OperationsMapper } from './operations-mapper';

export class Permissions {

  public static async getPermissions(collaboratorId: ObjectId, collectionName: string, operation: string): Promise<string[]> {
    try {
      const collaborators = connection.models.collaborators;

      const collaboratorPopulated = await collaborators.findById(collaboratorId)
        .populate({ path: 'roles', populate: { path: 'permissions', match: { 'collection_name': collectionName, 'operation': operation } } });

      if (!collaboratorPopulated) {
        return [];
      }
      const roles: any[] = collaboratorPopulated.roles;
      return Permissions.getPermissionsFromRoles(roles);
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  private static getPermissionsFromRoles(roles): string[] {
    let permissions = [];
    roles.forEach((rol: any) => {
      if (rol.permissions.length > 0) {
        permissions = permissions.concat(rol.permissions.map(r => r.filter));
      }
    });
    return permissions;
  }

  public static getOperationByMethodName(method: string): string {
    return OperationsMapper[method];
  }

}
