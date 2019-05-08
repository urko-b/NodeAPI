import { CollectionSchema } from './collection-schema';

/**
 * {@link SyncSchema}
 */
export class SyncSchema {
  public collectionsToSync: CollectionSchema[];
  public collectionsToUnsync: CollectionSchema[];
}
