var defaultConfig = require("../../../lib/default-config");
var cli = require("../../../lib/cli");
var init = cli.init;
var options = cli.options;

var allowed = Object.keys(defaultConfig);

var assert = require("chai").assert;

describe("Merging Options", function () {
    var argv;
    beforeEach(function () {
        argv = {};
    });
    it("should merge default + command line options", function () {
        argv.server = {
            baseDir: "./"
        };
        var config = init.mergeOptions(defaultConfig, argv, allowed);
        assert.equal(config.server.baseDir, "./");
    });
    it("should merge default + command line options", function () {
        argv.server = {
            baseDir: "app"
        };
        var config = init.mergeOptions(defaultConfig, argv, allowed);
        assert.equal(config.server.baseDir, "app");
    });
    it("should merge default + command line options", function () {
        argv.server = {
            baseDir: "app",
            index: "inde.htm"
        };
        var config = init.mergeOptions(defaultConfig, argv, allowed);
        assert.equal(config.server.baseDir, "app");
        assert.equal(config.server.index, "inde.htm");
    });
    it("should merge default + command line options", function () {
        argv.server = true;
        argv.ghostMode = {
            links: false
        };
        var config = init.mergeOptions(defaultConfig, argv, Object.keys(defaultConfig));
        assert.equal(config.server.baseDir, "./");
        assert.equal(config.ghostMode.links, false);
    });
    it("should merge default + command line options", function () {
        argv.proxy = "http://0.0.0.0:8000";
        argv.ghostMode = {
            links: false
        };
        var config = init.mergeOptions(defaultConfig, argv, Object.keys(defaultConfig));
        assert.equal(config.proxy.host, "0.0.0.0");
        assert.equal(config.proxy.protocol, "http");
        assert.equal(config.proxy.port, 8000);
        assert.equal(config.ghostMode.links, false);
    });
    it("should merge files, excludes + options", function () {
        argv.exclude = "*.html";
        var files = "*.css";
        var actual = options._mergeFilesOption(files, argv.exclude);
        var expected = ["*.css", "!*.html"];
        assert.deepEqual(actual, expected);
    });
});
