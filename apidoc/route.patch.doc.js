
/**
 * @api {get}/{entity} Partial Update of T
 * @apiVersion 0.0.0
 * @apiName Patch<T>
 * @apiGroup Entity
 *
 * @apiParam {object[]} id: The Entiy id
 * 
 * @apiSuccess {object} An object that represents the requested entity
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "field1": "value",
 *      "field2": "value",
 *      "field3": [
 *        "field3.1": "value",
 *        "field3.2": "value"
 *      ]
 *     }
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
