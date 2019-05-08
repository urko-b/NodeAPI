
export class CollectionSchema {
  public collection_name: string;
  public collection_schema?: string;

  /**
   *
   */
  constructor(collection_name: string, collection_schema?: string) {
    this.collection_name = collection_name;
    this.collection_schema = collection_schema;
  }
}
