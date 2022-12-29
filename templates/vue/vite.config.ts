import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Pages from "vite-plugin-pages";
import { VitePWA } from "vite-plugin-pwa";
import Inspect from "vite-plugin-inspect";
import Inspector from "vite-plugin-vue-inspector";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";

export default defineConfig({
    resolve: {
        alias: {},
    },
    server: {
        port: 3000,
    },
    plugins: [
        vue({
            reactivityTransform: true, // enables $ref stuff
        }),
        Pages(), // file-based routing
        AutoImport({
            imports: ["vue", "vue-router", "vue-i18n", "@vueuse/core"],
            dirs: ["src/composables", "src/stores"],
            vueTemplate: true,
            dts: "src/generated/auto-imports.d.ts",
        }),
        // Auto import for components
        Components({
            include: [/\.vue$/, /\.vue\?vue/],
            dts: "src/generated/components.d.ts"
        }),
        VitePWA({
            registerType: "autoUpdate",
            includeAssets: ["favicon.svg"],
            manifest: {
                name: "Create-blech Vue Template",
                short_name: "Vue Template",
                theme_color: "#ffffff",
                icons: [
                    {
                        src: "/pwa-192x192.png", // TODO: create these icons
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "/pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                    {
                        src: "/pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "any maskable",
                    },
                ],
            },
        }),
        Inspect(),
        Inspector(),
    ],
});
