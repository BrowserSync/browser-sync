var cli = require("../../../dist/cli/cli-options");
var merge = cli.merge;
var assert = require("chai").assert;

describe("CLI: Options: dealing with 'ignore' option", function() {
    it("watches in server mode (no files given)", function() {
        var cwd = "/Users/shakyshane/app";
        var input = {
            server: true,
            files: ["**/*"],
            ignore: ["**/*.php"],
            cwd: cwd
        };
        var config = merge(input)[0].toJS();
        assert.deepEqual(config.files, { core: { globs: ["**/*"], objs: [] } });
        assert.ok(config.watchOptions.ignored.indexOf("**/*.php") > -1);
    });
});
