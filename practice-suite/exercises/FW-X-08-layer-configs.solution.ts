export type LayerConfig = { use: { baseURL: string; extraHTTPHeaders?: Record<string, string> } };

export function mergeConfigs(base: LayerConfig, overlay: LayerConfig): LayerConfig {
  return {
    use: {
      ...base.use,
      ...overlay.use,
      extraHTTPHeaders: {
        ...base.use.extraHTTPHeaders,
        ...overlay.use.extraHTTPHeaders,
      },
    },
  };
}
