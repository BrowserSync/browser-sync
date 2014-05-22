
var browserSync = require("./lib/index");

console.time("init");

var files = ["test/fixtures/assets/*", "test/fixtures/*.html"];

var options = {
//    server: {
//        baseDir: ["test/fixtures"]
//    },
//    proxy: "swoon.static/store-home.php",
    ghostMode: {
        forms: {
            submit: false
        }
    },
//    tunnel: true,
    ports: {
        min: 4000,
        max: 4003
    },
    open: true,
    logConnections: false,
    minify: true,
//    host: ,
    notify: true,
    xip: false,
    browser: ["google chrome"]
};

//var clientScript = require("/Users/shakyshane/Sites/browser-sync-modules/browser-sync-client/index");
//
//browserSync.use("client:script", clientScript.middleware, function (err) {
//    console.log(err);
//});

var bs = browserSync.init(files, options, function (err, bs) {
    console.timeEnd("init");
//    setTimeout(function () {
//        browserSync.notify("5 Seconds have passed!");
//    }, 5000);
});
