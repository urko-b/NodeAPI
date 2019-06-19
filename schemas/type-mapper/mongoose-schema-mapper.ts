import { Schema } from 'mongoose';
import { MongooseTypeMapper } from './mongoose-type-mapper';


export class MongooseSchemaMapper {
  public static map(jsonSchema: any): Schema<any> {
    let mongooseSchema = {};
    for (const fieldName in jsonSchema) {
      if (jsonSchema.hasOwnProperty(fieldName)) {
        const fieldType = jsonSchema[fieldName];

        mongooseSchema[fieldName] = this.isPopulateField(fieldType)
          ? this.getMongoosePopulate(fieldType)
          : (MongooseTypeMapper[fieldType] ? MongooseTypeMapper[fieldType] : fieldType);
      }
    }
    return new Schema(mongooseSchema);
  }

  private static getMongoosePopulate(populateField: any | any[]): any | any[] {
    if (MongooseSchemaMapper.isObject(populateField)) {
      return MongooseSchemaMapper.getMongoosePopulateType(populateField);
    } else {
      let mongoosePopulateFields = [];
      populateField.forEach(field => {
        const obj = MongooseSchemaMapper.getMongoosePopulateType(field);
        mongoosePopulateFields.push(obj);
      });
      return mongoosePopulateFields;
    }
  }

  private static getMongoosePopulateType(field: any): any {
    let mongoosePopulate = {};
    for (const fieldName in field) {
      if (field.hasOwnProperty(fieldName)) {
        const fieldValue = field[fieldName];
        mongoosePopulate[fieldName] = MongooseTypeMapper[fieldValue] ? MongooseTypeMapper[fieldValue] : fieldValue;
      }
    }
    return mongoosePopulate;
  }

  private static isPopulateField(fieldType: any) {
    return Array.isArray(fieldType) || MongooseSchemaMapper.isObject(fieldType);
  }

  private static isObject(fieldType: any): boolean {
    return typeof fieldType === 'object';
  }
}

