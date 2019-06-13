import { Schema } from 'mongoose';
import { MongooseTypeMapper } from './mongoose-type-mapper';


export class MongooseSchemaMapper {
  public static map(jsonSchema): Schema<any> {
    let outputSchemaDef = {};
    for (const fieldName in jsonSchema) {
      if (jsonSchema.hasOwnProperty(fieldName)) {
        const fieldType = jsonSchema[fieldName];
        if (MongooseTypeMapper[fieldType]) {
          outputSchemaDef[fieldName] = MongooseTypeMapper[fieldType];
        } else {
          console.error('invalid type specified:', fieldType);
        }
      }
    }
    return new Schema(outputSchemaDef);
  }
}
