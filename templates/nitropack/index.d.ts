// This exports the response types from the route handlers
import type { InternalApi } from "nitropack";
export type API = InternalApi;

export type RouteOutput<TRoute extends keyof API> = API[TRoute];
