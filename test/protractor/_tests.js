var fs = require("fs");
var path = require("path");
var connect = require("connect");
var serveStatic = require("serve-static");
var http = require("http");

var tempFile;

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
    "Server": {
        bsConfig: {
            server: "./test/fixtures",
            open: false,
            logLevel: "silent"
        }
    },
    "Snippet": {
        bsConfig: {
            logLevel: "silent"
        },
        before: function (bs, cb) {
            var filepath = path.resolve( __dirname + "/../fixtures/index.html");
            var file = tempFile = fs.readFileSync(filepath, "utf-8");
            var modded = file.replace("<!-- BrowserSync -->", bs.getOption("snippet"));
            var app = connect();
            app.use(serveStatic(path.resolve(__dirname + "/../fixtures")));
            var server = http.createServer(app).listen();
            var port = server.address().port;
            var url = "http://localhost:" + port;
            process.env["BS_BASE"]        = url;
            fs.writeFileSync(filepath, modded);
            cb();
        },
        after: function (bs, cb) {
            var filepath = path.resolve( __dirname + "/../fixtures/index.html");
            var file = fs.readFileSync(filepath, "utf-8");
            var modded = file.replace(bs.getOption("snippet"), "<!-- BrowserSync -->");
            fs.writeFileSync(filepath, modded);
            cb();
        }
    }
};