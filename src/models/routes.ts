import type { RequestHandler } from 'express';

export interface RouteConfig {
  path: string;
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  middlewares?: RequestHandler[];
  handler: RequestHandler | RequestHandler[];
}

export interface RouteGroup {
  basePath: string;
  routes: RouteConfig[];
}
