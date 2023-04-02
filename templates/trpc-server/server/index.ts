import { observable } from "@trpc/server/observable";
import { procedure, router } from "../lib/trpc";

export const AppRouter = router({
    hello: procedure.query(({ ctx }) => {
        return "Hello, world!";
    }),
    test: procedure.subscription(({ ctx }) => {
        return observable<{ randomNumber: number }>((emit) => {
            const timer = setInterval(() => {
                emit.next({ randomNumber: Math.random() });
            }, 1000);
            
            return () => {
                clearInterval(timer);
            };
        });
    }),
});
