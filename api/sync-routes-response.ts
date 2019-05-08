
export class SyncRoutesResponse {
  public syncedRoutes?: string;
  public unsyncedRoutes?: string;

  /**
   *
   */
  constructor(syncedRoutes?: string, unsyncedRoutes?: string) {
    this.syncedRoutes = syncedRoutes;
    this.unsyncedRoutes = unsyncedRoutes;
  }
}
