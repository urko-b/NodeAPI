
import * as express from 'express';
import * as jsonpatch from 'fast-json-patch';
import * as mongoose from 'mongoose';


export class PatchHandler {
    protected app: express.Application;
    protected routeName: string;
    protected resource: string;

    constructor(app: express.Application, routeName: string, resource: string) {
        this.app = app;
        this.routeName = routeName;
        this.resource = resource;
    }

    public registerPatch(): void {
        this.app.patch(`${this.routeName}/:id`, async (req, res) => {
            try {
                let patches: any = req.body;
                let id: any = req.params.id;

                var doc = await this.app.route[this.resource].findOne({ _id: new mongoose.Types.ObjectId(id) });

                let errors = jsonpatch.validate(patches, doc);
                if (errors != undefined) {
                    let responseErrors: string = this.handleJsonPatchError(errors, res, patches);
                    return res.status(400).send(res.__(responseErrors));
                }

                let documentPatched = jsonpatch.applyPatch(doc, patches, true);
                let newDoc = await this.app.route[this.resource].updateOne({ _id: new mongoose.Types.ObjectId(id) }, { $set: documentPatched.newDocument }, { new: true });

                return res.status(200).send(newDoc);
            } catch (err) {
                return res.status(400).send(res.__(err.message));
            }
        });
    };

    private handleJsonPatchError(errors: jsonpatch.JsonPatchError, res: any, patches: any): string {
        let responseErrors: string = '';
        if (Array.isArray(errors)) {
            for (let i: number = 0; i < errors.length; i++) {
                responseErrors += res.__('Errors in') + ` ${errors[i]} in ${patches[i]}`;
            }
        } else {
            responseErrors = `${errors.name}:` + res.__(errors.message) + ` --> ${JSON.stringify(errors.operation)}`;
        }
        return responseErrors;
    }
}