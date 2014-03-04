var defaultConfig = require("../../../lib/default-config");
var cli = require("../../../lib/cli");
var init = cli.init;
var allowed = init.allowedOptions;

describe("Merging Options", function () {
    var argv;
    before(function () {
        argv = {
            server: true
        }
    });
    it("should merge default + command line options", function () {
//        var config = init.mergeOptions(defaultConfig, argv, allowed);
//        assert.equal(config.server, true);
    });
});
