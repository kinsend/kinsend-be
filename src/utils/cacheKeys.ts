export const tokenCacheKey = (cacheKey: string): string => {
  return `:token:auth:${cacheKey}`;
};
