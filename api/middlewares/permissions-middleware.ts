
import { Application } from 'express';
import { connection } from 'mongoose';
import { Permissions } from '../../permissions/permissions';

export class PermissionsMidleware {
  public static canIDo = async (req, res, next) => {
    try {

      const collaboratorId = req.header('collaboratorId');
      const operation = Permissions.getOperationByMethodName(req.method);
      const collectionName = req.url.split('/')[req.url.split('/').length - 1];
      const permisions = await Permissions.getPermissions(collaboratorId, collectionName, operation);

      if (permisions.length === 0) {
        res.status(401);
        return next('Unauthorized');
      }

      let filters = [];
      permisions.forEach((permission: any) => {
        if (permission !== '') {
          filters.push(JSON.parse(permission));
        }
      });

      let findBy = {};
      if (filters.length > 0) {
        findBy = { '$or': filters };
      }

      const documents = await connection.models[collectionName].find(findBy);
      if (documents.length === 0) {
        res.status(401);
        return next('Unauthorized');
      }

      next();
    } catch (e) {
      console.error('error', e);
      return res.status(400).send(e);
    }
  }


}
