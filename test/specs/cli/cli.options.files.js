"use strict";

var cli             = require("../../../lib/cli/");
var merge           = cli.options.merge;
var hooks           = require("../../../lib/hooks");

var assert          = require("chai").assert;

describe("CLI: Options: Merging Options: Files", function () {
    it("should return the files property from string", function () {
        var imm = merge({files: ["css/*.css"]});
        assert.deepEqual(imm.get("files").toJS(), ["css/*.css"]);
    });
    it("should return the files property from string", function () {
        var imm = merge({
            files: "css/*.css, *.html"
        });
        assert.deepEqual(
            imm.get("files").toJS(),
            ["css/*.css", "*.html"]
        );
    });
    it("should return the files property from string", function () {
        var imm = merge({
            files: "css/*.css, test/fixtures/*.html"
        });
        assert.deepEqual(
            imm.get("files").toJS(),
            ["css/*.css", "test/fixtures/*.html"]
        );
    });
    it("should return the files property from array", function () {
        var imm = merge({files: ["css/*.css"]});
        assert.deepEqual(
            imm.get("files").toJS(),
            ["css/*.css"]
        );
    });
    it("should return the files property from array", function () {
        var imm = merge({files: ["css/*.css", "*.html"]});
        assert.deepEqual(
            imm.get("files").toJS(),
            ["css/*.css", "*.html"]
        );
    });
    it("should not break if 'exclude' option is provided without 'files' option", function () {
        var imm = merge({}, {
            exclude: "node_modules"
        });
        assert.isFalse(imm.get("files"));
    });
    it("E2E - return default namespaced watcher when string given", function (done) {

        var config = {
            files: "*.html"
        };

        var imm   = merge(config);
        var out   = hooks["files:watch"]([], imm.get("files"), {}).toJS();

        assert.deepEqual({
            core: ["*.html"]
        }, out);

        done();
    });
    it("E2E - return default namespaced watcher when array given", function (done) {

        var config = {
            files: ["*.html", "test/css/**"]
        };

        var imm   = merge(config);
        var out   = hooks["files:watch"]([], imm.get("files"), {}).toJS();

        assert.deepEqual({
            core: ["*.html", "test/css/**"]
        }, out);

        done();
    });
    it.skip("E2E - return plugin watcher when string given", function (done) {

        var config = {
            files: ["*.html", "test/css/**"]
        };

        var imm   = merge(config);
        var out   = hooks["files:watch"]([], imm.get("files"), {}).toJS();

        assert.deepEqual({
            core: ["*.html", "test/css/**"]
        }, out);

        done();
    });
    it("E2E - can register a cb fn for watchers", function (done) {

        var cb = function  () {
            console.log("hey");
        };

        var config = {
            files: {
                "*.html": true,
                "css/*.css" : cb
            }
        };

        var imm   = merge(config);
        var out   = hooks["files:watch"]([], imm.get("files"), {}).toJS();

        assert.deepEqual({
            core: {
                "*.html": true,
                "css/*.css": cb
            }
        }, out);

        done();
    });

});
