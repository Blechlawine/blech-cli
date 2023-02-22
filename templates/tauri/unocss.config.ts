import {
    defineConfig,
    presetAttributify,
    transformerCompileClass,
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
        presetIcons(),
    ],
    transformers: [transformerCompileClass()],
});
