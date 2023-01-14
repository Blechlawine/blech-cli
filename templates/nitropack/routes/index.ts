import { z } from "zod";
import defineZodRoute from "../lib/defineZodRoute";

const validator = z.object({ greeting: z.string() });

export default defineZodRoute(validator, (input) => {
    return {
        hello: input.greeting,
    };
});

export type Input = z.input<typeof validator>;
