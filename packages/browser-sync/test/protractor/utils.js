
var utils = require("../../dist/server/utils");
var connect = require("connect");

module.exports = {

    getApp: function getApp (options) {

        var html = "<!doctype html><html lang=\"en-US\"><head><meta charset=\"UTF-8\"><title>Browsersync</title></head><body>BS</body></html>";
        var app = connect();

        app.use("/", function (req, res) {
            res.setHeader("content-type", "text/html");
            res.end(html);
        });

        var appserver = utils.getServer(app, options);
        appserver.html = html;

        return appserver;
    }
};
