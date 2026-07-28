---
tier: CRT
tier_key: contractAndRealtime
id: contract-and-realtime
title: Contract testing & real-time expansion
lead: Extends the existing #contract-testing and WebSocket gap pages with a
  concrete Pact-style consumer/provider sketch, GraphQL query/mutation
  testing notes, and WebSocket frame-assertion patterns tied to the
  bank-demo live-balance feature.
difficulty: senior
topic: contract-testing
pw_version_introduced: "1.40"
---

# Contract testing & real-time expansion

Rendered on the site as expansions of the existing **Contracts & services** (`#contract-testing`) and **WebSocket & live UI** (`#websocket`) gap pages. This file is the durable source; see `learning-site/gap-pages-data.js` for the rendered Pact sketch, GraphQL mocking snippet, and WebSocket frame-assertion example.

## Pact-style consumer/provider sketch

The consumer (UI) test records the interactions it needs against a local Pact mock server and writes a contract file. The provider (API) then replays every recorded interaction against its real implementation in its own CI, failing the build if any interaction's shape has drifted — catching the class of bug in PF9 (API 500s only in staging) well before a shared environment.

```ts
// consumer side
await provider.addInteraction({
  state: 'account apex_user exists',
  uponReceiving: 'a request for the balance',
  withRequest: { method: 'GET', path: '/api/bank/balance' },
  willRespondWith: { status: 200, body: { checking: 4250, savings: 18400 } },
});
await provider.verify();

// provider side (runs in the API repo's CI)
new Verifier({ provider: 'bank-api', pactUrls: ['./pacts/ui-bank-api.json'] }).verifyProvider();
```

The interview-grade framing: contracts move a class of integration bug from "discovered in shared staging, several hours to bisect which service changed" to "discovered in the provider's own CI, in the PR that broke it."

## GraphQL query/mutation testing notes

Every GraphQL call hits the same endpoint, so mocking by URL alone is insufficient — match on the request body's `operationName` instead. For contract-style safety without a full Pact setup, validate mocked and real responses against the same generated TypeScript types (from a GraphQL codegen step) so a schema change surfaces as a type error before it surfaces as a runtime UI bug.

```ts
await page.route('**/graphql', async (route) => {
  const body = route.request().postDataJSON();
  if (body.operationName === 'GetBalance') {
    return route.fulfill({ json: { data: { balance: { checking: 4250 } } } });
  }
  return route.continue();
});
```

## WebSocket frame assertion patterns (bank-demo live balance)

Register `page.routeWebSocket()` before `page.goto()` — attaching after navigation misses the handshake, a top mistake candidates make live. Assert the **UI** as the primary signal (what the user actually sees), and treat captured frame contents as a secondary check that the right message *type* flowed — not a substitute for the UI assertion.

```ts
const frames: unknown[] = [];
await page.routeWebSocket('**/bank-live', (ws) => {
  ws.onMessage((msg) => {
    frames.push(JSON.parse(String(msg)));
    ws.send(msg);
  });
});
await page.goto('/index.html#bank-demo');
await expect(page.getByTestId('checking-balance')).toContainText('4,250');
expect(frames.some((f: any) => f.type === 'balance-update')).toBe(true);
```

Close code `1000` is a normal close; `1006` is abnormal (connection dropped without a close frame) — worth naming in an interview to show depth without turning it into CDP trivia.
