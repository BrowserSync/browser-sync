var browserSync = require("./lib/index");

//var bs = browserSync.init("test/fixtures/**/*.css", {
//    server: {
//        baseDir: "test/fixtures"
//    },
//    reloadDelay: 2000
//});

var bs = browserSync.init(null, {
    proxy: {
        host: "localhost",
        port: 8000
    },
    startPath: "/information?rel=2342"
}).on("init", function (api) {

}).on("file:reload", function (file) {
    console.log("FILE INJECTED: " + file.assetFileName);
});

setInterval(function () {
    bs.emit("file:changed", {path: "style.css"});
}, 5000);
