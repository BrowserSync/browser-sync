var browserSync = require("../../index");
var exec        = require("child_process").exec;
var path        = require("path");
var configFile  = path.resolve(__dirname + "/config.js");

module.exports = function (logger) {

    return function (config, cb) {

        var instance = browserSync(config.bsConfig, function (err, bs) {
            var url = bs.getOption("urls.local");
            process.env["BS_BASE"]        = url;
            process.env["BS_SCRIPT_PATH"] = bs.getOption("scriptPaths.path");
            logger.info("Testing BrowserSync at %s", url);

            if (config.before) {
                config.before(bs, function () {
                    runTests(config, bs, cb);
                });
            } else {
                runTests(config, bs, cb);
            }
        });
        return instance;
    }
};


function runTests (config, bs, cb) {
    var out = "";
    exec("protractor " + configFile, function (err, stdout) {
        if (err) {
            doCallback({
                code: 1,
                message: stdout
            })
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