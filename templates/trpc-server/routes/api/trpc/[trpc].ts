import { createNitroAdapter } from "../../../lib/nitro-adapter";
import { AppRouter } from "../../../server";

export const trpc = createNitroAdapter({
    router: AppRouter,
    async createContext(event) {
        return {
            event,
        };
    },
    endpoint: "/api/trpc",
});
