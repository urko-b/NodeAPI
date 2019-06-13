import { Schema } from 'mongoose';
import { MongooseTypeMapper } from './mongoose-type-mapper';


export class MongooseSchemaMapper {
  public static map(jsonSchema): Schema<any> {
    let outputSchemaDef = {};
    for (const fieldName in jsonSchema) {
      if (jsonSchema.hasOwnProperty(fieldName)) {
        const fieldType = jsonSchema[fieldName];

        if (this.isPopulateField(fieldType)) {
          outputSchemaDef[fieldName] = this.getMongoosePopulateType(fieldType);
        } else {
          outputSchemaDef[fieldName] = MongooseTypeMapper[fieldType] ?
            MongooseTypeMapper[fieldType] : fieldType;
        }
      }
    }
    return new Schema(outputSchemaDef);
  }

  private static getMongoosePopulateType(populateFields: any[]) {
    let mongoosePopulateFields = [];
    populateFields.forEach(field => {
      let obj = {};
      for (const key in field) {
        if (field.hasOwnProperty(key)) {
          const value = field[key];
          obj[key] = MongooseTypeMapper[value] ? MongooseTypeMapper[value] : value;
        }
      }
      mongoosePopulateFields.push(obj);
    });
    return mongoosePopulateFields;
  }

  private static isPopulateField(fieldType: any) {
    return Array.isArray(fieldType);
  }
}

