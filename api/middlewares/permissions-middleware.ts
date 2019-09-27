
import * as JSON from 'circular-json';
import { connection } from 'mongoose';
import { Permissions } from '../../permissions/permissions';

export class PermissionsMidleware {
  public static canIDo = async (req, res, next) => {
    try {
      const collaboratorId = req.header('collaboratorId');
      const operation = Permissions.getOperationByMethodName(req.method);
      let collectionName = '';

      collectionName = PermissionsMidleware.getCollectionNameFromRoute(req);
      if (collectionName === 'SyncSchema') {
        next();
      }

      const permisions = await Permissions.getPermissions(collaboratorId, collectionName, operation);

      if (!PermissionsMidleware.hasPermissions(permisions)) {
        res.status(401);
        return next('Unauthorized');
      }

      const filters = PermissionsMidleware.getFiltersFromPermissions(permisions);
      let findBy = {};
      if (filters.length > 0) {
        findBy = { '$or': filters };
      }
      const documents = await connection.models[collectionName].find(findBy);
      if (PermissionsMidleware.cantDoRequestedOperation(documents, operation)) {
        res.status(401);
        return next('Unauthorized');
      }

      req.findBy = findBy;
      next();
    } catch (e) {
      console.error('error', e);
      return res.status(400).send(e);
    }
  }

  private static getFiltersFromPermissions(permisions: any[]) {
    let filters = [];
    permisions.forEach((permission: any) => {
      if (permission !== '') {
        filters.push(JSON.parse(permission));
      }
    });
    return filters;
  }

  private static cantDoRequestedOperation(documents: any[], operation: string): boolean {
    return (documents.length === 0 && operation === 'find');
  }

  private static hasPermissions(permisions: any[]): boolean {
    return permisions.length !== 0;
  }

  private static getCollectionNameFromRoute(req: any): string {
    return req.route !== undefined ?
      req.route.path.split('/')[3] :
      req.url.split('/')[req.url.split('/').length - 1];
  }
}
