const { writeFileSync } = require("fs");
const out1 = require("esbuild").buildSync({
    entryPoints: ["./dist/index.js"],
    bundle: true,
    platform: "node",
    packages: "external",
    outfile: "dist2/index.js",
    sourcemap: "inline",
    metafile: true
});

writeFileSync("meta1.json", JSON.stringify(out1.metafile));

const out2 = require("esbuild").buildSync({
    entryPoints: ["./dist/bin.js"],
    bundle: true,
    platform: "node",
    packages: "external",
    outfile: "dist2/bin.js",
    sourcemap: "inline",
    metafile: true
});

writeFileSync("meta2.json", JSON.stringify(out2.metafile));

// require("esbuild").buildSync({
//     entryPoints: ["./lodash.custom.js"],
//     bundle: true,
//     platform: "node",
//     format: "esm",
//     packages: "external",
//     outfile: "lib/underbar.js",
//     banner: {
//         js: "// @ts-nocheck"
//     }
// });
