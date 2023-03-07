import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Pages from "vite-plugin-pages";
import Inspect from "vite-plugin-inspect";
import Inspector from "vite-plugin-vue-inspector";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import Unocss from "unocss/vite";

export default defineConfig({
    plugins: [
        vue(),
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
            dts: "src/generated/components.d.ts",
        }),
        Unocss(),
        Inspect(),
        Inspector(),
    ],

    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    // prevent vite from obscuring rust errors
    clearScreen: false,
    // tauri expects a fixed port, fail if that port is not available
    server: {
        port: 1420,
        strictPort: true,
    },
    // to make use of `TAURI_DEBUG` and other env variables
    // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
    envPrefix: ["VITE_", "TAURI_"],
    build: {
        // Tauri supports es2021
        target: process.env.TAURI_PLATFORM === "windows" ? "chrome105" : "safari13",
        // don't minify for debug builds
        minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
        // produce sourcemaps for debug builds
        sourcemap: !!process.env.TAURI_DEBUG,
    },
});
