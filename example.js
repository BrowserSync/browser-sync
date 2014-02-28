var browserSync = require("./lib/index");
var files = ["test/fixtures/**/*.css", "test/fixtures/**/*.html"];
var bs = browserSync.init(files, {
    server: {
        baseDir: "test/fixtures"
    },
    ports: {
        min: 3000,
        max: 3001
    }
});