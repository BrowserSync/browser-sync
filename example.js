
var browserSync = require("./lib/index");

console.time("init");

var files = ["test/fixtures/assets/*", "test/fixtures/*.html"];

var options = {
    server: {
        baseDir: ["test/fixtures"]
    },
//    proxy: "swoon.static/store-home.php",
    ghostMode: {
        forms: {
            submit: false
        }
    },
    files: files,
//    tunnel: true,
    port: 8080,
    open: true,
    logConnections: false,
    minify: true,
    logLevel: "debug",
    notify: true,
    xip: false,
    browser: ["google chrome"]
};

//var clientScript = require("/Users/shakyshane/Sites/browser-sync-modules/browser-sync-client/index");
//
//browserSync.use("client:script", clientScript.middleware, function (err) {
//    console.log(err);
//});

var bs = browserSync.init(options, function (err, bs) {});
