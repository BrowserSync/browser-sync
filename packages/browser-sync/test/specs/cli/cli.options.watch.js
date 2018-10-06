var cli = require("../../../dist/cli/cli-options");
var merge = cli.merge;
var assert = require("chai").assert;

describe("CLI: Options: Merging Watch Option", function() {
    it("watches in server mode (no files given)", function() {
        var input = { server: true, watch: true };
        var config = merge(input)[0].toJS();
        assert.deepEqual(config.files, { core: { globs: ["."], objs: [] } });
        assert.ok(config.watchOptions.ignored.length);
    });
    it("watches in server mode (files given also)", function() {
        var input = { server: true, watch: true, files: ["/shane"] };
        var config = merge(input)[0].toJS();
        assert.deepEqual(config.files, {
            core: { globs: ["/shane", "."], objs: [] }
        });
    });
    it("does not add default ignore paths if watch option is absent", function() {
        var input = { server: true, files: ["/shane"] };
        var config = merge(input)[0].toJS();
        assert.isUndefined(config.watchOptions.ignored);
    });
    it("does not add 'default' ignore options if 'ignore' provided in config", function() {
        var input = {
            server: true,
            files: ["/shane"],
            ignore: ["/shane/*.css"]
        };
        var config = merge(input)[0].toJS();
        assert.deepEqual(config.watchOptions.ignored, ["/shane/*.css"]);
    });
    it("watches from serveStatic option (no files given also)", function() {
        var input = { serveStatic: ["./test"], watch: true };
        var config = merge(input)[0].toJS();
        assert.deepEqual(config.files, {
            core: { globs: ["./test"], objs: [] }
        });
    });
    it("watches from serveStatic option (files given also)", function() {
        var input = {
            serveStatic: ["./test"],
            watch: true,
            files: ["/some-path"]
        };
        var config = merge(input)[0].toJS();
        assert.deepEqual(config.files, {
            core: { globs: ["/some-path", "./test"], objs: [] }
        });
    });
    it("watches from server as string option", function() {
        var input = { server: "./test", watch: true };
        var config = merge(input)[0].toJS();
        assert.deepEqual(config.files, {
            core: { globs: ["./test"], objs: [] }
        });
    });
    it("watches from server as Array<string> option", function() {
        var input = { server: ["./test", ".tmp"], watch: true };
        var config = merge(input)[0].toJS();
        assert.deepEqual(config.files, {
            core: { globs: ["./test", ".tmp"], objs: [] }
        });
    });
    it("watches from server.baseDir as string", function() {
        var input = { server: { baseDir: "./test" }, watch: true };
        var config = merge(input)[0].toJS();
        assert.deepEqual(config.files, {
            core: { globs: ["./test"], objs: [] }
        });
    });
    it("watches from server.baseDir as Array<string>", function() {
        var input = { server: { baseDir: ["./test", ".tmp"] }, watch: true };
        var config = merge(input)[0].toJS();
        assert.deepEqual(config.files, {
            core: { globs: ["./test", ".tmp"], objs: [] }
        });
    });
    it("merges from ignore path (string)", function() {
        var input = { server: ["."], watch: true, ignore: "*.json" };
        var [config] = merge(input);
        assert.ok(config.getIn(["watchOptions", "ignored"]).contains("*.json"));
    });
    it("merges from ignore path + watchOptions (string)", function() {
        var input = {
            server: ["."],
            watch: true,
            ignore: "*.json",
            watchOptions: { ignored: "*.txt" }
        };
        var [config] = merge(input);
        assert.ok(config.getIn(["watchOptions", "ignored"]).contains("*.txt"));
        assert.ok(config.getIn(["watchOptions", "ignored"]).contains("*.json"));
    });
    it("merges from ignore path + watchOptions (Array<string>)", function() {
        var input = {
            server: ["."],
            watch: true,
            ignore: ["*.json", "*.json2"],
            watchOptions: { ignored: ["*.txt", "*.txt2"] }
        };
        var [config] = merge(input);
        assert.ok(config.getIn(["watchOptions", "ignored"]).contains("*.txt"));
        assert.ok(config.getIn(["watchOptions", "ignored"]).contains("*.txt2"));
        assert.ok(config.getIn(["watchOptions", "ignored"]).contains("*.json"));
        assert.ok(
            config.getIn(["watchOptions", "ignored"]).contains("*.json2")
        );
    });
    it("merges from server, serveStatic + ignore path + watchOptions (Array<string>)", function() {
        var input = {
            server: ["."],
            watch: true,
            ignore: ["*.json", "*.json2"],
            watchOptions: { ignored: ["*.txt", "*.txt2"] }
        };
        var [config] = merge(input);
        assert.ok(config.getIn(["watchOptions", "ignored"]).contains("*.txt"));
        assert.ok(config.getIn(["watchOptions", "ignored"]).contains("*.txt2"));
        assert.ok(config.getIn(["watchOptions", "ignored"]).contains("*.json"));
        assert.ok(
            config.getIn(["watchOptions", "ignored"]).contains("*.json2")
        );
    });
    it("merges from server, serveStatic + ignore path + watchOptions.ignore (string)", function() {
        var input = {
            server: ["."],
            watch: true,
            ignore: ["*.json", "*.json2"],
            watchOptions: { ignored: "*.txt" }
        };
        var [config] = merge(input);

        assert.ok(config.getIn(["watchOptions", "ignored"]).contains("*.json"));
        assert.ok(
            config.getIn(["watchOptions", "ignored"]).contains("*.json2")
        );
        assert.ok(config.getIn(["watchOptions", "ignored"]).contains("*.txt"));
    });
});
