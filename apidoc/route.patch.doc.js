
/**
 * @api {patch}/{entity} Patch<T>
 * @apiVersion 0.0.0
 * @apiName Partial Update of a document
 * @apiGroup Entity
 *
 * @apiParam {object[]} id: The Entiy id
 * @apiExample Example usage:
 * curl -i http://localhost/book/5c8610b08e83da15001e2848
 * [{
 *	"op": "replace", "path": "/title", "value": "The art of Patch"
 * }]

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
 * 
 * 
 * @apiError BadRequest
 * 
 * @apiErrorExample Error-response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "errors": "OPERATION_PATH_UNRESOLVABLE:Cannot perform the operation at a path that does not exist --> {\"op\":\"replace\",\"path\":\"/invalidField\",\"value\":\"wwwwww\"}"
 *     }
 */
