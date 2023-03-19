import { inferAsyncReturnType, initTRPC } from "@trpc/server";
import { createNitroAdapter } from "./nitro-adapter";

const t = initTRPC.context<inferAsyncReturnType<typeof createContext>>().create();

export const router = t.router;

export const procedure = t.procedure;

export const middleware = t.middleware;

export async function createContext(
    opts: Parameters<Parameters<typeof createNitroAdapter>[0]["createContext"]>[0],
) {
    return {
        req: opts.req,
        res: opts.res,
    };
}
