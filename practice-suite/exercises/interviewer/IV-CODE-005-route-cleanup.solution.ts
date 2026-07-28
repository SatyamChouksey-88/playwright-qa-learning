export function hasRouteCleanup(code: string): boolean {
  const hasRoute = code.includes('page.route');
  const hasUnroute = code.includes('page.unroute') || code.includes('unrouteAll');
  return hasRoute && hasUnroute;
}
