var cli = require("../../../dist/cli/cli-options");
var merge = cli.merge;
var assert = require("chai").assert;

describe("ensures the CWD is transferred to the watchOptions.cwd ", function() {
    it("add cwd with files option", function() {
        var cwd = "/Users/shakyshane/app";
        var input = { server: true, files: "**/*.html", cwd: cwd };
        var config = merge(input)[0].toJS();
        assert.deepEqual(config.watchOptions.cwd, "/Users/shakyshane/app");
    });
});
