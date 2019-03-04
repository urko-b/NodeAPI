

import * as mongoose from 'mongoose'
export class AuthController {

  protected schema: mongoose.Schema
  protected model: mongoose.Model<any>
  private readonly Secrets: string = 'secrets'
  /**
   *
   */
  constructor() {
    this.init()
  }

  private init() {
    this.schema = new mongoose.Schema({
      'name': String,
      'secret': String
    })
    this.model = mongoose.model(
      this.Secrets,
      this.schema,
      this.Secrets
    )
  }

  public async isSecretValid(secret: string) {
    return await this.model.findOne({ 'secret': secret })
      .exec()
      .then((doc) => {
        if (doc === undefined || doc === null) {
          return false
        }

        return true
      })
      .catch(err => {
        console.warn('log error', err)
        throw err
      })
  }



}