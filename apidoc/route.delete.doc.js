
/**
 * @api {delete}/{entity} Delete<T>
 * @apiVersion 0.0.0
 * @apiName Delete a document from T entity collection
 * @apiGroup Entity
 *
 * @apiParam {object} id: The Entiy id
 * 
 * @apiExample Example usage:
 * curl -i http://localhost/book/5c8610b08e83da15001e2848
 * 
 * @apiSuccess No content response
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 204 No Content
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
