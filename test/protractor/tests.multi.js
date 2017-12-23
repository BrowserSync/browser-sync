
var connect = require("connect");
var utils = require("../../dist/server/utils");
var Immutable  = require("immutable");

function getApp (bs, options) {

    var html = "<!doctype html><html lang=\"en-US\"><head><meta charset=\"UTF-8\"><title>Browsersync</title></head><body>BS</body></html>";
    var app = connect();

    app.use("/", function (req, res) {
        res.setHeader("content-type", "text/html");
        res.end(html.replace("BS", bs.getOption("snippet")));
    });

    var appserver = utils.getServer(app, options);

    return appserver;
}

module.exports = {
    "Proxy Test Laravel App": {
        bsConfig: {
            proxy: "http://homestead.app:8000/",
            open: false,
            logLevel: "silent"
        }
    },
    "Proxy Test Wordpress": {
        bsConfig: {
            proxy: "http://wordpress.dev",
            open: false,
            logLevel: "silent"
        }
    },
    "Proxy Test Localhost": {
        bsConfig: {
            proxy: "localhost",
            open: false,
            logLevel: "silent"
        }
    },
    "Secure Proxy": {
        bsConfig: {
            proxy: "https://grenade.static:8890",
            open: false,
            logLevel: "silent"
        }
    },
    "Server": {
        bsConfig: {
            server: "./test/fixtures",
            open: false,
            logLevel: "silent"
        }
    },
    "Secure Server": {
        bsConfig: {
            server: "./test/fixtures",
            open: false,
            logLevel: "silent",
            https: true
        }
    },
    "Snippet": {
        bsConfig: {
            logLevel: "silent"
        },
        before: function (bs, cb) {
            var app = getApp(bs, Immutable.Map({scheme: "http"}));
            app.server.listen();
            process.env["BS_BASE"] = "http://localhost:" + app.server.address().port;
            cb();
        }
    },
    "Secure Snippet on Insecure Website": {
        bsConfig: {
            logLevel: "silent",
            https: true
        },
        before: function (bs, cb) {

            var app = getApp(bs, Immutable.Map({scheme: "http"}));
            app.server.listen();
            process.env["BS_BASE"] = "http://localhost:" + app.server.address().port;
            cb();
        }
    },
    "Secure Snippet on Secure Website": {
        bsConfig: {
            logLevel: "silent",
            https: true
        },
        before: function (bs, cb) {

            var app = getApp(bs, Immutable.Map({scheme: "https"}));
            app.server.listen();
            process.env["BS_BASE"] = "https://localhost:" + app.server.address().port;
            cb();
        }
    }
};
