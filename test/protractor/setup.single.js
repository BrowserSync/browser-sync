"use strict";

var eachSeries  = require("async-each-series");
var path        = require("path");
var logger      = require("./logger");
var ptor        = require("./runProtractor");

var tests       = require("./tests.single");
var configFile  = path.resolve(__dirname + "/config.single");

eachSeries(tests, function (testFile, asyncCallback) {
    logger.info("Running: {yellow:%s", testFile);
    process.env["BS_TEST_FILE"] = "tests/" + testFile;
    ptor({}, configFile, function (err, out) {
        if (out) {
            // console.log(out) //debugging
        }
        if (!err) {
            logger.info("{green:Tests Passed:} {yellow:%s", testFile);
        }
        if (err) {
            return asyncCallback(err);
        }

        asyncCallback();
    });
}, function (err) {
    if (err) {
        logger.error(err.stdout || err.message);
        process.exit(1);
    }
    process.exit(0);
});
