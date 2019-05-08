export class Route {
  public collectionName: string;
  public methods: string[];
  public route: string;
  public strict: object;
  public mongooseSchema: string;
  public updateOptions: object;

  constructor(
    collectionName: string,
    methods: string[],
    route: string,
    mongooseSchema: string,
    updateOptions?: object,
    strict?: object
  ) {
    this.collectionName = collectionName;
    this.methods = methods;
    this.route = route;
    this.strict = strict;
    this.mongooseSchema = mongooseSchema;
    this.updateOptions = updateOptions;
  }
}
