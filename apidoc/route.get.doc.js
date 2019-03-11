/**
 * @api {get}/{entity} Get List<T>
 * @apiVersion 0.0.0
 * @apiName Get List of documents
 * @apiGroup Entity
 *
 * @apiExample Example usage:
 * curl -i http://localhost/crag
 * 
 * [
 *   {
 *       "_id": "5c55b0e109c0662434838624",
 *       "name": "Patones",
 *       "description": "Es un lugar muy bonito con todo tipo de vías, las vías del sector El muro de los lamentos, son vias de placa",
 *       "sectors": [
 *           {
 *               "routes": [
 *                   {
 *                       "name": "Ludwig van bene",
 *                       "grade": "6c+",
 *                       "height": "22",
 *                       "_id": "5c5714d5ebc82f35182114e0"
 *                   },
 *                   {
 *                       "name": "Madame Blavastsky",
 *                       "grade": "6c",
 *                       "height": 55,
 *                       "_id": "5c5714e1ebc82f35182114e1"
 *                   }
 *               ],
 *               "_id": "5c56a60b4d9a552434ce3ae2",
 *               "name": "El muro de los lamentos"
 *           },
 *           {
 *               "routes": [
 *                   {
 *                       "name": "Yuppies in the Gym",
 *                       "grade": "6b+",
 *                       "height": 20
 *                   },
 *                   {
 *                       "name": "Estupendiux",
 *                       "grade": "7a",
 *                       "height": 18
 *                   }
 *               ],
 *               "_id": "5c56a6354d9a552434ce3ae4",
 *               "name": "Stradivarius"
 *           }
 *       ],
 *       "location": {
 *           " latitude": 40.873081,
 *           "longitude": -3.4636744
 *       }
 *   },
 *   {
 *       "_id": "5c55b0f409c0662434838625",
 *       "name": "La Pedriza",
 *       "description": "Escuela de rooca de granito, escalada de adherencia",
 *       "sectors": [
 *           {
 *               "routes": [
 *                   {
 *                       "name": "Pienso en ti con mi mano",
 *                       "grade": "6b",
 *                       "height": 15
 *                   },
 *                   {
 *                       "name": "Kaledonian",
 *                       "grade": "6b+",
 *                       "height": 16
 *                   }
 *               ],
 *               "name": "Quebrantaherraduras Inferior",
 *               "description": "Vías de adherencia",
 *               "_id": "5c55a93f4d9a552434ce3ade"
 *           }
 *       ],
 *       "location": {
 *           " latitude": 40.6138588,
 *           "longitude": -4.0527363
 *       }
 *   }
 * ]
 * @apiSuccess {object[]} Array of objects. Each object represents the entity
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [{
 *       "field1": "value",
 *       "field2": "value"
 *     },{
 *       "field1": "value",
 *       "field2": "value"
 *     }]
 *
 * @apiError NotFound The Resource .
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "UserNotFound"
 *     }
 **/

/** 
 * @api {get}/{entity}?queryString Get List Filtered<T>
 * @apiVersion 0.0.0
 * @apiName List<T> filtered
 * @apiGroup Entity
 *
 * @apiExample Example usage:
 * curl -i http://localhost/crag?sectors.name__equals=Quebrantaherraduras Inferior
 * [
 *   {
 *       "_id": "5c55b0f409c0662434838625",
 *       "name": "La Pedriza",
 *       "description": "Escuela de roca de granito, escalada de adherencia",
 *       "sectors": [
 *           {
 *               "routes": [
 *                   {
 *                       "name": "Pienso en ti con mi mano",
 *                       "grade": "6b",
 *                       "height": 15
 *                   },
 *                   {
 *                       "name": "Kaledonian",
 *                       "grade": "6b+",
 *                       "height": 16
 *                   }
 *               ],
 *               "name": "Quebrantaherraduras Inferior",
 *               "description": "Vías de adherencia",
 *               "_id": "5c55a93f4d9a552434ce3ade"
 *           }
 *       ],
 *       "location": {
 *           " latitude": 40.6138588,
 *           "longitude": -4.0527363
 *       }
 *   }
 * ]
 * 
 * @apiSuccess {object[]} Array of objects. Each object represents the entity
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [{
 *       "field1": "value",
 *       "field2": "value"
 *     },{
 *       "field1": "value",
 *       "field2": "value"
 *     }]
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
 **/ 

 /**
 * @api {get}/{entity}/:id Get<T>
 * @apiVersion 0.0.0
 * @apiName Get a document from requested entity collection
 * @apiGroup Entity
 *
 * @apiParam {Guid} id: The Entiy id
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

