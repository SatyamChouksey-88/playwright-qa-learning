export function mockJsonRoute(body: unknown) {
  void body;
  return async () => {};
}
