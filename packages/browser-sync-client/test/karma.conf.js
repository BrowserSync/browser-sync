// Karma configuration
// Generated on Wed Sep 18 2013 18:10:53 GMT+0100 (BST)
var conf = require("./test.conf");

module.exports = function (config) {
    conf.logLevel = config.LOG_INFO;
    config.set(conf);
};
