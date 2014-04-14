
var browserSync = require("./lib/index");

console.time("init");

var files = ["test/fixtures/assets/*", "test/fixtures/*.html"];

var options = {
    server: {
        baseDir: "test/fixtures"
    },
    ghostMode: {
        location: true
    },
    open: true,
    logConnections: false,
    minify: true,
    ports: {
        min: 2000
    },
    notify: {
//        styles: [
//            "background-color: red",
//            "color: white",
//            "padding: 10px",
//            "display: none",
//            "font-family: sans-serif",
//            "position: absolute",
//            "z-index: 9999",
//            "right: 0px",
//            "border-bottom-left-radius: 5px"
//        ]
    }
};

var clientScript = require("/Users/shakyshane/Sites/browser-sync-modules/browser-sync-client/index");

browserSync.use("client:script", clientScript.middleware, function (err) {
    console.log(err);
});

var bs = browserSync.init(files, options, function (err, bs) {
//    setTimeout(function () {
//        browserSync.reload();
//    }, 3000);
});
