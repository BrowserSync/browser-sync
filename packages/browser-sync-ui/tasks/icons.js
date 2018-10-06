var easysvg = require("easy-svg");
var vfs     = require("vinyl-fs");

/**
 * Compile SVG Symbols
 */
function icons (opts, ctx, done) {
    return vfs.src(opts.input)
        .pipe(easysvg.stream({js: false}))
        .on('error', done)
        .pipe(vfs.dest(opts.output))
}

module.exports.tasks = [icons];
