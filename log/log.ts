import { Types } from 'mongoose'

export class Log {
  public collaborator_id: Types.ObjectId
  public date: Date
  public operation: String
  public collection_name: String
  public payload: String
  public old_value: String
  public new_value: String
  /**
   *
   */
  constructor(
    collaborator_id?: Types.ObjectId,
    operation?: String,
    collection_name?: String,
    payload?: String,
    old_value?: String,
    new_value?: String
  ) {
    this.collaborator_id = collaborator_id
    this.operation = operation
    this.collection_name = collection_name
    this.payload = payload
    this.old_value = old_value
    this.new_value = new_value
  }
}
