import {
    defineConfig,
    presetAttributify,
    presetIcons,
    presetTypography,
    presetWind,
    transformerCompileClass,
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
