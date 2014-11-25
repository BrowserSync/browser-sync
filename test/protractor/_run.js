"use strict";

var browserSync = require("../../");
var exec        = require("child_process").exec;

module.exports = function (logger) {

    return function (config, configFile, cb) {

        var instance = browserSync(config.bsConfig, function (err, bs) {
            var url = bs.getOption("urls.local");
            process.env["BS_BASE"]        = url;
            process.env["BS_SCRIPT_PATH"] = bs.getOption("scriptPaths.path");
            logger.info("Testing BrowserSync at %s", url);

            if (config.before) {
                config.before(bs, function () {
                    runTests(config, configFile, bs, cb);
                });
            } else {
                runTests(config, configFile, bs, cb);
            }
        });
        return instance;
    };
};

function runTests (config, configFile, bs, cb) {
    var out = "";
    exec("protractor " + configFile, function (err, stdout) {
        if (err) {
            doCallback({
                code: 1,
                message: err.message ? err.message : stdout
            });
            process.exit(1);
        }
        out += stdout;
    }).on("close", function (code) {
        if (code !== 0) {
            doCallback({
                code: code,
                message: "Protractor tests failed, Details below"
            }, out);
        } else {
            doCallback(null, out);
        }
    });

    function doCallback(err, out) {
        if (config.after) {
            config.after(bs, function () {
                cb(err, out);
            });
        } else {
            cb(err, out);
        }
    }
}
