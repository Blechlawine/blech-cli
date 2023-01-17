import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import UnoCSS from "unocss/astro";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
    site: "https://example.com",
    integrations: [
        UnoCSS(),
        mdx(),
        sitemap(),
        svelte(),
    ],
});
