import { Model, model, Schema } from 'mongoose';

export class AuthController {
  protected schema: Schema;
  protected model: Model<any>;

  public init() {
    this.schema = new Schema({
      name: String,
      system_token: String
    });

    this.model = model(
      process.env.SYSTEM_TOKENS,
      this.schema,
      process.env.SYSTEM_TOKENS
    );
  }

  public async isTokenValid(token: string) {
    try {
      const tokenFound = await this.model
        .findOne({ system_token: token })
        .exec();

      return this.tokenExists(tokenFound);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private tokenExists(tokenFound: object) {
    return tokenFound !== undefined && tokenFound !== null;
  }
}
