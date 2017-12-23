var cli = require("../../../dist/cli/cli-options");
var merge = cli.merge;
var assert = require("chai").assert;

describe("CLI: Options: Merging Server Options", function() {
    it("doesn't touch server option if not given in user config", function() {
        var imm = merge({});
        assert.deepEqual(imm.get("server"), false);
    });
    it("should merge when only basedir given", function() {
        var imm = merge({ server: "base" });
        assert.deepEqual(imm.get("server").toJS(), {
            baseDir: "base"
        });
    });
    it("should merge when only `true` given`", function() {
        var imm = merge({ server: true });
        assert.deepEqual(imm.get("server").toJS(), {
            baseDir: "./"
        });
    });
    it("should merge when only an array` given`", function() {
        var imm = merge({ server: ["./dist", ".tmp"] });
        assert.deepEqual(imm.get("server").toJS(), {
            baseDir: ["./dist", ".tmp"]
        });
    });
    it("should merge when nested props given", function() {
        var imm = merge({
            server: {
                baseDir: "./app"
            }
        });
        assert.deepEqual(imm.get("server").toJS(), {
            baseDir: "./app"
        });
    });
    it("should merge when multiple nested props given", function() {
        var imm = merge({
            server: {
                index: "index.htm",
                baseDir: "./app",
                middleware: function() {
                    console.log("from fn");
                }
            }
        });
        assert.equal(imm.getIn(["server", "baseDir"]), "./app");
        assert.equal(imm.getIn(["server", "index"]), "index.htm");
        assert.isFunction(imm.getIn(["server", "middleware"]));
    });
    it("can merge cli flags into object", function() {
        var argv = {
            server: true,
            index: "index.htm"
        };
        var imm = merge({}, argv);
        assert.deepEqual(imm.get("server").toJS(), {
            baseDir: "./",
            index: "index.htm"
        });
    });
    it("can merge cli flags into object", function() {
        var argv = {
            server: true,
            directory: true
        };
        var imm = merge({}, argv);
        assert.deepEqual(imm.get("server").toJS(), {
            baseDir: "./",
            directory: true
        });
    });
    it("can merge cli flags into object", function() {
        var argv = {
            server: true,
            directory: true
        };
        var imm = merge({}, argv);
        assert.deepEqual(imm.get("server").toJS(), {
            baseDir: "./",
            directory: true
        });
    });
    it("can merge cli flags into object", function() {
        var argv = {
            server: "app",
            directory: true,
            index: "file.html"
        };
        var imm = merge({ server: "app" }, argv);
        assert.deepEqual(imm.get("server").toJS(), {
            baseDir: "app",
            directory: true,
            index: "file.html"
        });
    });
});
