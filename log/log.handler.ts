
import * as express from 'express'
import * as mongoose from 'mongoose'
import { ObjectId } from 'bson'

export class Log {
  public collaborator_id: ObjectId
  public date: Date
  public operation: String
  public collection_name: String
  public payload: String
  public old_value: String
  public new_value: String
  /**
   *
   */
  constructor (collaborator_id?: ObjectId, operation?: String, collection_name?: String,
    payload?: String, old_value?: String, new_value?: String) {
    this.collaborator_id = collaborator_id
    this.operation = operation
    this.collection_name = collection_name
    this.payload = payload
    this.old_value = old_value
    this.new_value = new_value
  }

}

export class LogHandler {
  protected app: express.Application
  protected schema: mongoose.Schema
  protected model: mongoose.Model<any>
  private readonly AuditLog: string = 'audit_log'

  /**
   *
   */
  constructor (app: express.Application) {
    this.app = app
    this.init()
  }

  private init () {
    this.schema = new mongoose.Schema({
      collaborator_id: ObjectId,
      date: {'type': Date,
        'default': Date.now()},
      operation: String,
      collection_name: String,
      payload: String,
      old_value: String,
      new_value: String
    })

    this.model = mongoose.model(
      this.AuditLog,
      this.schema,
      this.AuditLog
    )
  }

  /**
   * insert log
   */
  public async insertLog (log: Log) {
    await this.model.insertMany([log])
    .catch(err => {
      console.warn('log error', err)
      throw err
    })
  }
}
