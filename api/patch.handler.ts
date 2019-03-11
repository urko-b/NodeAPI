import * as express from 'express'
import * as jsonpatch from 'fast-json-patch'
import * as mongoose from 'mongoose'

export class PatchHandler {
  protected app: express.Application
  protected routeName: string
  protected resource: string

  constructor(app: express.Application, routeName: string, resource: string) {
    this.app = app
    this.routeName = routeName
    this.resource = resource
  }

  public registerPatch(): void {
    this.app.patch(`${this.routeName}/:id`, async (req, res) => {
      try {
        const patches: any = req.body
        const id: any = req.params.id

        const doc = await this.app.route[this.resource].findOne({
          _id: new mongoose.Types.ObjectId(id)
        })

        const errors = jsonpatch.validate(patches, doc)
        if (errors !== undefined) {
          const responseErrors: object = this.handleJsonPatchError(
            errors,
            res,
            patches
          )
          return res.status(400).send(responseErrors)
        }

        const documentPatched = jsonpatch.applyPatch(doc, patches, true)
        const newDoc = await this.app.route[this.resource].updateOne(
          { _id: new mongoose.Types.ObjectId(id) },
          { $set: documentPatched.newDocument },
          { new: true }
        )

        return res.status(200).send(newDoc)
      } catch (err) {
        return res.status(400).send(res.__(err.message))
      }
    })
  }

  private handleJsonPatchError(
    errors: jsonpatch.JsonPatchError,
    res: any,
    patches: any
  ): object {
    let responseErrors: string = ''
    if (Array.isArray(errors)) {
      for (let i: number = 0; i < errors.length; i++) {
        responseErrors += res.__('Errors in') + ` ${res.__(errors[i])} in ${res.__(patches[i])}`
      }
    } else {
      responseErrors =
        `${errors.name}:` +
        res.__(errors.message) +
        ` --> ${JSON.stringify(errors.operation)}`
    }
    
    return {'errors': responseErrors}
  }
}
