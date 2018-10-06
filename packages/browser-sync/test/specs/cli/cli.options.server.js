var cli = require("../../../dist/cli/cli-options");
var merge = cli.merge;
var assert = require("chai").assert;

describe("CLI: Options: Merging Server Options", function() {
    it("doesn't touch server option if not given in user config", function() {
        var [imm] = merge({});
        assert.deepEqual(imm.get("server"), false);
    });
    it("should merge when only basedir given", function() {
        var [imm] = merge({ server: "base" });
        assert.deepEqual(imm.get("server").toJS(), {
            baseDir: ["base"],
            serveStaticOptions: {
                index: "index.html"
            }
        });
    });
    it("should merge when only `true` given`", function() {
        var [imm] = merge({ server: true });
        assert.deepEqual(imm.get("server").toJS(), {
            baseDir: ["./"],
            serveStaticOptions: {
                index: "index.html"
            }
        });
    });
    it("should merge when only an array` given`", function() {
        var [imm] = merge({ server: ["./dist", ".tmp"] });
        assert.deepEqual(imm.get("server").toJS(), {
            baseDir: ["./dist", ".tmp"],
            serveStaticOptions: {
                index: "index.html"
            }
        });
    });
    it("should merge when nested props given", function() {
        var [imm] = merge({
            server: {
                baseDir: "./app"
            }
        });
        assert.deepEqual(imm.get("server").toJS(), {
            baseDir: ["./app"],
            serveStaticOptions: {
                index: "index.html"
            }
        });
    });
    it("should merge when multiple nested props given", function() {
        var [imm] = merge({
            server: {
                index: "index.htm",
                baseDir: "./app",
                middleware: function() {
                    console.log("from fn");
                }
            }
        });
        assert.equal(imm.getIn(["server", "baseDir", 0]), "./app");
        assert.equal(imm.getIn(["server", "index"]), "index.htm");
        assert.isFunction(imm.getIn(["server", "middleware"]));
    });
    it("can merge cli flags into object (1)", function() {
        var argv = {
            server: true,
            index: "index.htm"
        };
        var [imm] = merge(argv);
        assert.deepEqual(imm.get("server").toJS(), {
            baseDir: ["./"],
            index: "index.htm",
            serveStaticOptions: {
                index: "index.htm"
            }
        });
    });
    it("can merge cli flags into object (2)", function() {
        var argv = {
            server: true,
            directory: true
        };
        var [imm] = merge(argv);
        assert.deepEqual(imm.get("server").toJS(), {
            baseDir: ["./"],
            directory: true,
            serveStaticOptions: {
                index: "index.html"
            }
        });
    });
    it("can merge cli flags into object (3)", function() {
        var argv = {
            server: true,
            directory: true
        };
        var [imm] = merge(argv);
        assert.deepEqual(imm.get("server").toJS(), {
            baseDir: ["./"],
            directory: true,
            serveStaticOptions: {
                index: "index.html"
            }
        });
    });
    it("can merge cli flags into object (4)", function() {
        var [imm] = merge({
            server: "app",
            directory: true,
            index: "file.html"
        });
        assert.deepEqual(imm.get("server").toJS(), {
            baseDir: ["app"],
            directory: true,
            index: "file.html",
            serveStaticOptions: {
                index: "file.html"
            }
        });
    });
    it("can set baseDir when only routes are provided", function() {
        var [imm] = merge({
            server: {
                routes: {
                    "/node_modules": "node_modules"
                }
            }
        });
        assert.deepEqual(imm.get("server").toJS(), {
            routes: { "/node_modules": "node_modules" },
            baseDir: ["./"],
            serveStaticOptions: { index: "index.html" }
        });
    });
});
