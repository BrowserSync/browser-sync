var browserSync = require("./lib/index");

var bs = browserSync.init("test/fixtures/**/*.css", {
    server: {
        baseDir: "test/fixtures"
    },
    ports: {
        min: 2000
    },
    open: false,
    scrollProportionally: true
}).on("init", function (api) {

}).on("file:reload", function (file) {
//    console.log("FILE INJECTED: " + file.assetFileName);
});
