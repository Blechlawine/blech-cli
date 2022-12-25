import { defineBuildConfig } from "unbuild";

// for config options, see https://github.com/unjs/unbuild/blob/HEAD/src/types.ts
export default defineBuildConfig({
    entries: [
        // inputs to build
        "lib/index",
    ],
    rollup: {
        emitCJS: true, // generates common js module
    },
});
