export type LayerConfig = { use: { baseURL: string; extraHTTPHeaders?: Record<string, string> } };

export function mergeConfigs(base: LayerConfig, overlay: LayerConfig): LayerConfig {
  void overlay;
  return base;
}
