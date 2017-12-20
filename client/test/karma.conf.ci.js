// Config for travis
var conf = require("./test.conf");

module.exports = function (config) {

    conf.logLevel       = config.LOG_INFO;
    conf.autoWatch      = false;
    conf.browsers       = ["Firefox"];
    conf.preprocessors  = {
        "fixtures/*.html" : ["html2js"]
    };
    conf.singleRun = true;

    config.set(conf);
};