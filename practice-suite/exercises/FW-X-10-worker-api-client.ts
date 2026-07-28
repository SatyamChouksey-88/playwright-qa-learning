export type ClientMeta = { scope: 'test' | 'worker'; disposed: boolean };

export class ApiClient {
  meta: ClientMeta;

  constructor(scope: 'test' | 'worker' = 'test') {
    // TODO: default to worker scope for a shared API client fixture
    this.meta = { scope, disposed: false };
  }

  async dispose(): Promise<void> {
    this.meta.disposed = true;
  }
}
