"use strict";

var eachSeries  = require("async-each-series");
var path        = require("path");
var logger      = require("./logger");
var run         = require("./_run")(logger);

var tests       = require("./tests.multi");
var configFile  = path.resolve(__dirname + "/config.multi");

eachSeries(Object.keys(tests), function (item, asyncCallback) {
    logger.info("Running: {yellow:%s", item);
    process.env["BS_TEST_NAME"] = item;
    var bs = run(tests[item], configFile, function (err, out) {
        bs.cleanup();
        if (out) {
            //console.log(out);
        }
        if (err) {
            return asyncCallback(err);
        }
        asyncCallback();
    });
}, function (err) {
    if (err) {
        console.log(err.message);
        logger.error("Tests failed");
        process.exit(1);
    }
    process.exit(0);
});
