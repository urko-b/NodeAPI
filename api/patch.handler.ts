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

  public registerPatch(): void {
    this.app.patch(`${this.routeName}/:id`, async (req, res) => {
      try {
        const jsonPatches: any = req.body
        const documentId: any = req.params.id

        const documentToPatch = await this.getDocument(documentId)
        if (!this.documentExists(documentToPatch)) {
          return res
            .status(404)
            .send(res.__('Document requested could not be found'))
        }

        const patchErrors = jsonpatch.validate(jsonPatches, documentToPatch)
        if (!this.isValidPatch(patchErrors)) {
          delete patchErrors.tree
          return res.status(400).send(patchErrors)
        }

        const validateOperation: boolean = true
        const patchedDocument = jsonpatch.applyPatch(
          documentToPatch,
          jsonPatches,
          validateOperation
        )
        const updatedDocument = await this.updateDocument(
          documentId,
          patchedDocument
        )

        return res.status(200).send(updatedDocument)
      } catch (err) {
        return res.status(400).send(res.__(err.message))
      }
    })
  }

  private documentExists(documentToPatch: any) {
    return documentToPatch != null
  }

  private isValidPatch(patchErrors: jsonpatch.JsonPatchError) {
    return patchErrors === undefined
  }

  private async updateDocument(documentId: any, patchedDocument) {
    return mongoose.connection.models[this.resource].updateOne(
      { _id: new mongoose.Types.ObjectId(documentId) },
      { $set: patchedDocument.newDocument },
      { new: true }
    )
  }

  private async getDocument(documentId: any) {
    return mongoose.connection.models[this.resource].findOne({
      _id: new mongoose.Types.ObjectId(documentId)
    })
  }
}
