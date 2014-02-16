var browserSync = require("./lib/index");

var bs = browserSync.init("test/fixtures/**/*.css", {
    server: {
        baseDir: "test/fixtures"
    }
}).on("init", function (api) {

}).on("file:reload", function (file) {
    console.log("FILE INJECTED: " + file.assetFileName);
});

//setInterval(function () {
//    bs.emit("file:changed", {path: "style.css"});
//}, 5000);
