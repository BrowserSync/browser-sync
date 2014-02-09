var browserSync = require("./lib/index");

var bs = browserSync.init("test/fixtures/**/*.css", {
    server: {
        baseDir: "test/fixtures"
    },
    reloadDelay: 2000
});

