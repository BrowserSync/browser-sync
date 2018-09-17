
var exec = require("child_process").exec;

function runTests (config, configFile, cb) {
    var out = "";
    exec("protractor " + configFile, function (err, stdout) {
        if (err) {
            doCallback({
                code: 1,
                message: err.message ? err.message : stdout,
                stdout: stdout,
                err: err
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
            config.after(function () {
                cb(err, out);
            });
        } else {
            cb(err, out);
        }
    }
}

module.exports = runTests;
