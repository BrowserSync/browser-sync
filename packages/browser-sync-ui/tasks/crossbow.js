var crossbow = require('crossbow-sites');
var vfs = require('vinyl-fs');
var resolve = require('path').resolve;

const input = [
    "src/crossbow/*.hbs",
    "src/crossbow/components/*.hbs",
    "src/crossbow/content/*.hbs",
];

vfs.src(input.map(x => resolve(x)))
    .pipe(crossbow.stream({
        config: {base: "src/crossbow"},
        data: {site: "file:_config.yml"},
    }))
    .pipe(vfs.dest("./static"));
