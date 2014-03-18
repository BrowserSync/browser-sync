var browserSync = require("./lib/index");

var files = ["test/fixtures/assets/*", "test/fixtures/*.html"];

var options = {
    server: {
        baseDir: "test/fixtures"
    }
};

//browserSync.use("client:script", function () {
//    var file = require("fs").readFileSync("./browser-sync-client.js");
//    return function (req, res) {
//        res.setHeader("Content-Type", "text/javascript");
//        res.end(file);
//    };
//});

browserSync.init(files, options, function (err, bs) {
    return true;
});

