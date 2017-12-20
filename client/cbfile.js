var cb         = require("crossbow");
var vfs         = require("vinyl-fs");
var jshint     = require("gulp-jshint");
var uglify     = require("gulp-uglify");
var contribs   = require("gulp-contribs");
var through2   = require("through2");
var rename     = require("gulp-rename");
var browserify = require("browserify");
var source     = require("vinyl-source-stream");

cb.task("lint-test", function lintTest() {
    return vfs.src(["test/client-new/*.js", "test/middleware/*.js", "cbfile.js"])
        .pipe(jshint("test/.jshintrc"))
        .pipe(jshint.reporter("default"))
        .pipe(jshint.reporter("fail"));
});

cb.task("lint-lib", function lintLib() {
    return vfs.src(["lib/*", "!lib/browser-sync-client.js", "!lib/events.js", "!lib/client-shims.js"])
        .pipe(jshint("lib/.jshintrc"))
        .pipe(jshint.reporter("default"))
        .pipe(jshint.reporter("fail"));
});

cb.task("contribs", function contribs() {
    return vfs.src("README.md")
        .pipe(contribs())
        .pipe(vfs.dest("./"));
});

/**
 * Strip debug statements
 * @returns {*}
 */
var stripDebug = function () {
    var chunks = [];
    return through2.obj(function (file, enc, cb) {
        chunks.push(file);
        var string = file._contents.toString();
        var regex  = /\/\*\*debug:start\*\*\/[\s\S]*\/\*\*debug:end\*\*\//g;
        var stripped = string.replace(regex, "");
        file.contents = new Buffer(stripped);
        this.push(file);
        cb();
    });
};

cb.task("bundle", function bundle() {
    return browserify("./lib/index.js")
        .bundle()
        .pipe(source("index.js"))
        .pipe(vfs.dest("./dist"));
});

cb.task("minify", function minify() {
    return vfs.src(["dist/index.js"])
        .pipe(stripDebug())
        .pipe(rename("index.min.js"))
        .pipe(uglify())
        .pipe(vfs.dest("./dist"));
});

cb.task("build-all", ["bundle", "minify"]);

cb.task("dev", {
    description: "Build-all & then watch for changes",
    tasks: [
        "build-all",
        function () {
            cb.watch(["lib/*.js", "test/client-new/**/*.js"], ["build-all"], {block: true});
        }
    ]
});

cb.task("default", ["lint-lib", "lint-test", "build-all"]);

cb.group("karma", {
    watch: "@npm karma start test/karma.conf.js",
    unit: "@npm karma start test/karma.conf.ci.js"
});

cb.task("test", [
    "default",
    "@npm mocha test/middleware",
    "karma:unit"
]);
