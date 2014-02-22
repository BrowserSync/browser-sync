var browserSync = require("./lib/index");

var files = ["test/fixtures/**/*.css", "test/fixtures/**/*.html"];
var bs = browserSync.init(files, {
//    server: {
//        baseDir: "test/fixtures"
//    },
    proxy: {
        host: "172.22.22.22",
        port: 80
    },
    ports: {
        min: 2000
    },
    open: true,
    scrollProportionally: true
}).on("init", function (api) {

}).on("file:reload", function (file) {
//    console.log("FILE INJECTED: " + file.assetFileName);
});
