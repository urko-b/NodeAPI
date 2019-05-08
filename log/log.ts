import { Types } from 'mongoose';

export class Log {
  public collaborator_id: Types.ObjectId;
  public date: Date;
  public operation: string;
  public collection_name: string;
  public payload: string;
  public old_value: string;
  public new_value: string;

  /**
   *
   */
  constructor(
    collaborator_id?: Types.ObjectId,
    operation?: string,
    collection_name?: string,
    payload?: string,
    old_value?: string,
    new_value?: string
  ) {
    this.collaborator_id = collaborator_id;
    this.operation = operation;
    this.collection_name = collection_name;
    this.payload = payload;
    this.old_value = old_value;
    this.new_value = new_value;
  }
}
