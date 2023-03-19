import { createNitroAdapter } from "../../../lib/nitro-adapter";
import { createContext } from "../../../lib/trpc";
import { AppRouter } from "../../../server";

export const trpc = createNitroAdapter({
    router: AppRouter,
    createContext,
    endpoint: "/api/trpc",
});
