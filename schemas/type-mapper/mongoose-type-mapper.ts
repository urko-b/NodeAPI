import { Schema } from 'mongoose';

export const MongooseTypeMapper = {
  'String': Schema.Types.String,
  'Date': Schema.Types.Date,
  'Number': Schema.Types.Number,
  'Boolean': Schema.Types.Boolean,
  'ObjectId': Schema.Types.ObjectId,
  'Buffer': Schema.Types.Buffer,
  'Mixed': Schema.Types.Mixed,
  'Array': Schema.Types.Array,
  'Decimal128': Schema.Types.Decimal128
};
