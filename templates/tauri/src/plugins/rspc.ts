import { Plugin } from "vue";
import { ProceduresLike, createClient } from "@rspc/client";
import { TauriTransport } from "@rspc/tauri";

export default function createRspc<T extends ProceduresLike>(): Plugin {
    const client = createClient<T>({
        transport: new TauriTransport(),
    });
    return {
        install(app) {
            app.config.globalProperties.$rspc = client;
            app.provide("rspc", client);
        }
    }
}
