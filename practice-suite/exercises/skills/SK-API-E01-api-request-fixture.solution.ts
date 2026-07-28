import { request as pwRequest } from '@playwright/test';

export async function getStatusCode(baseUrl: string, path: string): Promise<number> {
  const ctx = await pwRequest.newContext({ baseURL: baseUrl });
  const res = await ctx.get(path);
  const code = res.status();
  await ctx.dispose();
  return code;
}
