
import * as mongoose from 'mongoose'
export class AuthController {

  protected schema: mongoose.Schema
  protected model: mongoose.Model<any>
  private readonly SystemTokens: string = 'system_tokens'

  /**
   *
   */
  constructor () {
    this.init()
  }

  private init () {
    this.schema = new mongoose.Schema({
      'name': String,
      'system_token' : String
    })
    this.model = mongoose.model(
      this.SystemTokens,
      this.schema,
      this.SystemTokens
    )
  }

  public async isTokenValid (token: string) {
    return this.model.findOne({ 'system_token': token })
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
