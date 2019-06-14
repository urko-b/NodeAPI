import { Schema } from 'mongoose';
import { MongooseTypeMapper } from './mongoose-type-mapper';


export class MongooseSchemaMapper {
  public static map(jsonSchema: any): Schema<any> {
    let mongooseSchema = {};
    for (const fieldName in jsonSchema) {
      if (jsonSchema.hasOwnProperty(fieldName)) {
        const fieldType = jsonSchema[fieldName];

        mongooseSchema[fieldName] = this.isPopulateField(fieldType)
          ? this.getMongoosePopulateType(fieldType)
          : (MongooseTypeMapper[fieldType] ? MongooseTypeMapper[fieldType] : fieldType);
      }
    }
    return new Schema(mongooseSchema);
  }

  private static getMongoosePopulateType(populateFields: any[]) {
    let mongoosePopulateFields = [];
    populateFields.forEach(field => {
      let obj = {};
      for (const fieldName in field) {
        if (field.hasOwnProperty(fieldName)) {
          const fieldValue = field[fieldName];
          obj[fieldName] = MongooseTypeMapper[fieldValue] ? MongooseTypeMapper[fieldValue] : fieldValue;
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

