require("esbuild").buildSync({
    entryPoints: ["./lib/index.js"],
    bundle: true,
    platform: "node",
    packages: "external",
    outfile: "dist/index.js",
    sourcemap: "inline"
});

require("esbuild").buildSync({
    entryPoints: ["./lib/bin.js"],
    bundle: true,
    platform: "node",
    packages: "external",
    outfile: "dist/bin.js",
    sourcemap: "inline"
});

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
