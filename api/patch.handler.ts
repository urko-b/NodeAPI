import { Application } from 'express';
import { applyPatch, JsonPatchError, validate } from 'fast-json-patch';
import { PatchResult } from 'fast-json-patch/lib/core';
import { connection, Types } from 'mongoose';

export class PatchHandler {
  protected app: Application;
  protected routeName: string;
  protected resource: string;

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
  constructor(app: Application, routeName: string, resource: string) {
    this.app = app;
    this.routeName = routeName;
    this.resource = resource;
  }

  public registerPatch(): void {
    this.app.patch(`${this.routeName}/:id`, async (req, res) => {
      try {
        const jsonPatches: any = req.body;
        const documentId: any = req.params.id;

        const documentToPatch = await this.getDocument(documentId);

        if (!this.documentExists(documentToPatch)) {
          return res
            .status(404)
            .send(res.__('Document requested could not be found'));
        }

        this.validatePatch(res, jsonPatches, documentToPatch);

        const patchedDocument = this.getPatchedDocument(documentToPatch, jsonPatches);

        const updatedDocument = await this.updateDocument(documentId, patchedDocument);

        return res.status(200).send(updatedDocument);
      } catch (err) {
        return res.status(400).send(res.__(err.message));
      }
    });
  }

  private async getDocument(documentId: any) {
    return connection.models[this.resource].findOne({
      _id: new Types.ObjectId(documentId)
    });
  }

  private documentExists(documentToPatch: any) {
    return documentToPatch != null;
  }

  private validatePatch(res: any, jsonPatches: any, documentToPatch: any) {
    const patchErrors = validate(jsonPatches, documentToPatch);
    if (!this.isValidPatch(patchErrors)) {
      delete patchErrors.tree;
      return res.status(400).send(patchErrors);
    }
  }

  private isValidPatch(patchErrors: JsonPatchError) {
    return patchErrors === undefined;
  }

  private getPatchedDocument(documentToPatch: any, jsonPatches: any): PatchResult<any> {
    const validateOperation: boolean = true;
    const patchedDocument = applyPatch(documentToPatch, jsonPatches, validateOperation);
    return patchedDocument;
  }

  private async updateDocument(documentId: any, patchedDocument: any) {
    return connection.models[this.resource].updateOne(
      { _id: new Types.ObjectId(documentId) },
      { $set: patchedDocument.newDocument },
      { new: true }
    );
  }
}
