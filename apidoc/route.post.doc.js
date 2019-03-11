/**
 * @api {post}/{entity} Post<T>
 * @apiVersion 0.0.0
 * @apiName Post Entity<T>
 * @apiGroup Entity
 * 
 * @apiExample Example usage:
 * curl -i http://localhost/book/5c8610b08e83da15001e2848
 * {
 *    "title": "Clean code",
 *	  "description": "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees",
 *	  "author": {
 *		"name": "Robert",
 *		"surname": "C. Martin"
 *	  }
 * }
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
