import { SchemaHandler, CollectionSchema } from "schemas/schema.handler";


export class Route {
    public resource: string;
    public methods: Array<string>;
    public strict: Object;
    public model: string;
    public routeName: string;
    public updateOptions: Object;

    /**
     *
     */
    constructor(resource: string, methods: Array<string>, model: string, routeName: string, updateOptions?: Object, strict?: Object) {
        this.resource = resource;
        this.methods = methods;
        this.strict = strict;
        this.model = model;
        this.routeName = routeName;
        this.updateOptions = updateOptions;
    }
}

export class Models {

    protected schemaHandler: SchemaHandler;
    constructor() {
        this.initModelsArray();
        this.schemaHandler = new SchemaHandler();
        this.schemaHandler.fillSchema();
    }

    private _routes: Array<any>;
    public get routes(): Array<any> {
        return this._routes;
    }

    private initModelsArray(): void {
        const apiRoute = `/${process.env.WEBAPINAME}/${process.env.VERSION}`;
        let methods = ['get', 'post', 'put', 'patch', 'delete'];;

        this._routes = new Array<Route>();
        for (let collection of this.schemaHandler.collections) {
            let collection_name: string = collection.collection_name;
            this._routes.push(new Route(collection_name, methods, collection_name, `${apiRoute}/${collection_name}`, { new: true }));
        }
    }
}
