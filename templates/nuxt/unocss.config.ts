import {
    defineConfig,
    presetAttributify,
    presetIcons,
    transformerCompileClass,
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
        presetIcons(),
    ],
    transformers: [transformerCompileClass()],
});
