var browserSync = require("../../index");
var async       = require("async");

var logger      = require("eazy-logger").Logger({
    prefix: "{magenta:[BS E2E] ",
    useLevelPrefixes: true,
    custom: {
        "i": function (string) {
            return this.compile("{cyan:" + string + "}");
        }
    }
});

var run         = require("./_run")(logger);
var tests       = require("./_tests");

async.eachSeries(Object.keys(tests), function (item, cb) {
    logger.info("Running: {yellow:%s", item);
    process.env["BS_TEST_NAME"] = item;
    var bs = run(tests[item], function (err, out) {
        bs.cleanup();
        if (out) {
            console.log(out);
        }
        if (err) {
            return cb(err);
        }
        cb();
    });
}, function (err) {
    if (err) {
        console.log(err.message);
        logger.error("Tests failed");
        process.exit(1);
    }
    process.exit(0);
});

