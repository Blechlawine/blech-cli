import {
    defineConfig,
    transformerCompileClass,
    presetAttributify,
    presetIcons,
    presetTypography,
    presetWind,
} from "unocss";

export default defineConfig({
    presets: [
        presetAttributify({
            prefix: "uno:",
        }),
        presetWind(),
        presetTypography(),
    ],
    transformers: [transformerCompileClass()],
});
