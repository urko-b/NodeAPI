import * as express from 'express'
import * as jsonpatch from 'fast-json-patch'
import * as mongoose from 'mongoose'

export class PatchHandler {
  protected app: express.Application
  protected routeName: string
  protected resource: string

  /**
   *
   * @remarks
   * The constructor receives an express application, the route name where
   * the verb will be exposed and the name of the resource, the entity name.
   * Usually, routeName and resource will be the same
   *
   * @param app
   * @param routeName
   * @param resource
   */
  constructor(app: express.Application, routeName: string, resource: string) {
    this.app = app
    this.routeName = routeName
    this.resource = resource
  }

  /**
   *
   */
  public registerPatch(): void {
    this.app.patch(`${this.routeName}/:id`, async (req, res) => {
      try {
        const jsonPatches: any = req.body
        const documentId: any = req.params.id

        const documentToPatch = await this.app.route[this.resource].findOne({
          _id: new mongoose.Types.ObjectId(documentId)
        })

        const patchErrors = jsonpatch.validate(jsonPatches, documentToPatch)
        if (patchErrors !== undefined) {
          const responseErrors: string = this.handleJsonPatchError(
            patchErrors,
            res,
            jsonPatches
          )
          return res.status(400).send(res.__(responseErrors))
        }

        const validateOperation: boolean = true
        const patchedDocument = jsonpatch.applyPatch(
          documentToPatch,
          jsonPatches,
          validateOperation
        )
        const updatedDocument = await this.app.route[this.resource].updateOne(
          { _id: new mongoose.Types.ObjectId(documentId) },
          { $set: patchedDocument.newDocument },
          { new: true }
        )

        return res.status(200).send(updatedDocument)
      } catch (err) {
        return res.status(400).send(res.__(err.message))
      }
    })
  }

  /**
   *
   * @remarks
   *
   *
   * @param errors
   * @param res
   * @param patches
   */
  private handleJsonPatchError(
    errors: jsonpatch.JsonPatchError,
    res: any,
    patches: any
  ): string {
    let responseErrors: string = ''

    responseErrors = Array.isArray(errors)
      ? this.getPatchErrors(errors, res, patches)
      : this.getJsonPatchError(errors, res)

    return responseErrors
  }

  /**
   *
   * @param errors
   * @param res
   */
  private getJsonPatchError(errors: jsonpatch.JsonPatchError, res: any) {
    let responseErrors = ''
    try {
      responseErrors =
        `${errors.name}:` +
        res.__(errors.message) +
        ` --> ${JSON.stringify(errors.operation)}`
    } catch (error) {
      responseErrors = error
    }
    return responseErrors
  }

  /**
   *
   * @param errors
   * @param res
   * @param patches
   */
  private getPatchErrors(
    errors: jsonpatch.JsonPatchError & any[],
    res: any,
    patches: any
  ) {
    let responseErrors: string = ''
    for (let i: number = 0; i < errors.length; i++) {
      responseErrors += res.__('Errors in') + ` ${errors[i]} in ${patches[i]}`
    }
    return responseErrors
  }
}
