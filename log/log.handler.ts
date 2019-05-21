import { Application } from 'express';
import { Model, model, Schema, Types, Mongoose } from 'mongoose';
import { Log } from './log';

export class LogHandler {
  protected app: Application;
  protected schema: Schema;
  protected model: Model<any>;

  constructor(app: Application) {
    this.app = app;
  }

  public init() {
    this.schema = new Schema({
      collaborator_id: Schema.Types.ObjectId,
      collection_name: String,
      date: {
        default: Date.now(),
        type: Date
      },
      new_value: String,
      old_value: String,
      operation: String,
      payload: String
    });

    this.model = model(process.env.AUDIT_LOG, this.schema, process.env.AUDIT_LOG);
  }

  /**
   *
   * @param log {@link Log}
   */
  public async insertOne(log: Log) {
    try {
      await this.model.insertMany([log]);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async findOne(filter: object) {
    try {
      return await this.model
        .findOne(filter)
        .exec();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async findOneAndDelete(filter: object): Promise<boolean> {
    try {
      const doc = await this.model
        .findOneAndDelete(filter)
        .exec();

      return this.exists(doc);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }


  public exists(log: any): boolean {
    return log !== undefined && log !== null;
  }
}
