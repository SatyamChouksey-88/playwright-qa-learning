export {};

declare global {
  interface Window {
    SEARCH_INDEX?: { version: number; documentCount: number };
    BankDemoMocks?: Record<string, (body?: unknown) => unknown>;
    __BANK_PASSKEY_OK?: boolean;
  }
}
