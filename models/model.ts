

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

    constructor() {
        this.initModelsArray();
    }

    private _routes: Array<any>;
    public get routes(): Array<any> {
        return this._routes;
    }

    private initModelsArray(): void {
        const crag = 'crag';
        const book = 'book';

        const apiRoute = `/${process.env.WEBAPINAME}/${process.env.VERSION}`;
        let methods = ['get', 'post', 'put', 'patch', 'delete'];;

        this._routes = new Array<Route>();
        this._routes.push(new Route(book, methods, book, `${apiRoute}/${book}`, { new: true }));
        this._routes.push(new Route(crag, methods, crag, `${apiRoute}/${crag}`, { new: true }));
    }
}
