var crossbow = require('crossbow');
var vfs = require('vinyl-fs');
var resolve = require('path').resolve;

function crossbowBuild (opts) {
    return vfs.src(opts.input.map(x => resolve(x)))
        .pipe(crossbow.stream(opts.config))
        .pipe(vfs.dest(opts.output));
}

module.exports.tasks = [crossbowBuild];
