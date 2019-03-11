/**
 * @api {get}/SyncSchema Sync Schema
 * @apiVersion 0.0.0
 * @apiName Sync routes with schemas_collections in database
 * @apiGroup Entity
 *
 * 
 * @apiSuccess {object} An object with the information aboute the routes that has been synched and unsynched (added or removed from routing)
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "synchedRoutes": "All up to date",
 *      "unsynchedRoutes": "All up to date"
 *     }
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "synchedRoutes": "countries",
 *      "unsynchedRoutes": "All up to date"
 *     }
 *
 * 
 * @apiError NotFound The Resource .
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "status": 404,
 *       "message": "Object not found",
 *       "name": "ObjectNotFound",
 *       "errors": {
 *       "_id": {
 *         "message": "Could not find object with specified attributes"
 *       }
 *     }
 */

