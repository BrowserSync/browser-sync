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

var config = {
    "Proxy Test Laravel App": {
        proxy:   "http://homestead.app:8000/",
        open:     false,
        logLevel: "silent"
    },
    "Proxy Test Wordpress": {
        proxy:   "http://wordpress.dev",
        open:     false,
        logLevel: "silent"
    },
    "Server": {
        server:   "./test/fixtures",
        open:     false,
        logLevel: "silent"
    }
};

async.eachSeries(Object.keys(config), function (item, cb) {
    logger.info("Running: {yellow:%s", item);
    var bs = run(config[item], function (err, out) {
        bs.cleanup();
        console.log(out);
        if (err) {
            return cb(err);
        }
        cb();
    });
}, function (err) {
    if (err) {
        logger.error("Tests failed");
        process.exit(1);
    }
    process.exit(0);
});

