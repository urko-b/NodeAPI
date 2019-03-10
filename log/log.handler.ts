import * as express from 'express'
import * as mongoose from 'mongoose'
import { Log } from './log'

export class LogHandler {
  protected app: express.Application
  protected schema: mongoose.Schema
  protected model: mongoose.Model<any>
  private readonly AuditLog: string = 'audit_log'

  /**
   *
   */
  constructor(app: express.Application) {
    this.app = app
    this.init()
  }

  /**
   * insert log
   */
  public async insertOne(log: Log) {
    await this.model.insertMany([log]).catch(err => {
      console.warn('log error', err)
      throw err
    })
  }

  public async findOne(filter: object) {
    return this.model
      .findOne(filter)
      .exec()
      .then(doc => {
        return doc
      })
      .catch(err => {
        console.warn('log error', err)
        throw err
      })
  }

  public async findOneAndDelete(filter: object) {
    return this.model
      .findOneAndDelete(filter)
      .exec()
      .then(doc => {
        if (doc === undefined && doc === null) {
          console.warn('log error')
          throw new Error('Error while remove log')
        }
        return true
      })
      .catch(err => {
        console.warn('exception log error', err)
        throw err
      })
  }

  private init() {
    this.schema = new mongoose.Schema({
      collaborator_id: mongoose.Types.ObjectId,
      date: {
        type: Date,
        default: Date.now()
      },
      operation: String,
      collection_name: String,
      payload: String,
      old_value: String,
      new_value: String
    })

    this.model = mongoose.model(this.AuditLog, this.schema, this.AuditLog)
  }
}
