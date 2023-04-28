import { Client } from "@rspc/client";
import { Procedures } from "../generated/bindings";

export function useRspcClient() {
    const injected = inject<Client<Procedures>>("rspc");
    if (!injected) {
        throw new Error("rspc not injected");
    }
    return injected;
}
