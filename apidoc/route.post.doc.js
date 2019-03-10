/**
 * @api {post}/{entity} Post Entity<T>
 * @apiVersion 0.0.0
 * @apiName Post <T>
 * @apiGroup Entity
 *
 * @apiSuccess {object} Object that represent the entity that have just been added to the database entity collection
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "field1": "value",
 *       "field2": "value"
 *     }
 *
 * @apiError NotFound The Resource .
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "UserNotFound"
 *     }
 */
