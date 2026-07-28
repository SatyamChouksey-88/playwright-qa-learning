import { test, expect } from '@playwright/test';
import { mergeConfigs } from './FW-X-08-layer-configs';

test('FW-X-08: merge configs', () => {
  const base = { use: { baseURL: 'http://localhost', extraHTTPHeaders: { 'X-Base': '1' } } };
  const overlay = { use: { baseURL: 'https://staging.example', extraHTTPHeaders: { 'X-Overlay': '2' } } };
  const merged = mergeConfigs(base, overlay);
  expect(merged.use.baseURL).toBe('https://staging.example');
  expect(merged.use.extraHTTPHeaders).toEqual({ 'X-Base': '1', 'X-Overlay': '2' });
});