import { z } from "zod";

function defineZodRoute<TInput, TOutput, TResponse>(
    input: z.ZodType<TOutput, z.ZodTypeDef, TInput>,
    resolver: (input: TOutput) => TResponse
) {
    return defineEventHandler(async (event) => {
        const body = await readBody(event);
        const parsedInput = input.safeParse(body);
        if (parsedInput.success) {
            return resolver(parsedInput.data);
        } else {
            return parsedInput.error;
        }
    });
}

export default defineZodRoute;
