import { procedure, router } from "../lib/trpc";

export const AppRouter = router({
    hello: procedure.query(() => {
        return "Hello, world!";
    }),
});
