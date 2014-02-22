var browserSync = require("./lib/index");

var bs = browserSync.init("test/fixtures/**/*.css", {
//    server: {
//        baseDir: "test/fixtures"
//    },
    proxy: {
        host: "front.end",
        port: 80
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
