import { AnyRouter, inferRouterContext } from "@trpc/server";
import { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import { CreateWSSContextFnOptions, applyWSSHandler } from "@trpc/server/adapters/ws";
import { WebSocketServer } from "ws";
import { resolveHTTPResponse } from "@trpc/server/http";
import type { HTTPBaseHandlerOptions } from "@trpc/server/dist/http/internals/types";
import dayjs from "dayjs";
import { eventHandler, isMethod, readBody, setResponseHeaders } from "h3";
import Redis from "ioredis";
import { createURL } from "ufo";

const cacheKey = (...args: string[]): string => {
    return args.join("-");
};

export function createNitroAdapter<
    TRouter extends AnyRouter,
    TRequest,
    TContext extends inferRouterContext<TRouter>,
>(
    opts: {
        router: TRouter;
        createContext: (
            opts: CreateHTTPContextOptions | CreateWSSContextFnOptions,
        ) => Promise<TContext>;
        endpoint: string;
        cache?: {
            url: string;
            exclude?: RegExp;
            expire?: number;
            // TODO: specify include option, to only include certain paths
        };
    } & HTTPBaseHandlerOptions<TRouter, TRequest>,
) {
    const { createContext, router, endpoint } = opts;
    let redis: Redis | undefined = undefined;
    if (opts.cache) {
        redis = new Redis(opts.cache.url);
    }

    const wss = new WebSocketServer({ noServer: true });
    applyWSSHandler<TRouter>({
        wss,
        router,
        createContext,
    });

    return eventHandler(async (event) => {
        const { req } = event.node;
        const url = createURL(req.url!);
        const path = url.pathname.substring(endpoint.length + 1);
        if (redis && !opts.cache?.exclude?.test(path)) {
            const cached = await redis.get(cacheKey(path, url.searchParams.toString()));
            if (cached) {
                return cached;
            }
        }
        const context = await createContext(event.node);
        const result = await resolveHTTPResponse({
            batching: opts.batching,
            responseMeta: opts.responseMeta,
            createContext: () => context,
            req: {
                ...req,
                query: url.searchParams,
                body: isMethod(event, "GET") ? null : await readBody(event),
                method: req.method!,
            },
            path,
            router: router,
        });

        if (result?.headers) {
            const headers = { ...result.headers } as Record<string, string | string[]>;
            Object.entries(headers).forEach(
                // rome-ignore lint/performance/noDelete:
                ([key, value]) => value === undefined && delete headers[key],
            );
            setResponseHeaders(event, headers);
        }

        result.status = result.status;
        if (redis && result.body && !opts.cache?.exclude?.test(path)) {
            redis.set(cacheKey(path, url.searchParams.toString()), result.body);
            redis.expireat(
                cacheKey(path, url.searchParams.toString()),
                dayjs()
                    .add(opts.cache?.expire ?? 60 * 60 * 24, "second")
                    .unix(),
            );
        }
        return result.body;
    });
}
