"use strict";

var cli             = require("../../../lib/cli/");
var Immutable       = require("immutable");
var merge           = cli.options.merge;

var assert = require("chai").assert;

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
    it("should merge files option in namespace form", function () {
        var imm = merge({
            files: {
                shane: "test.html"
            }
        });
        assert.isTrue(
            Immutable.List.isList(
                imm.getIn(["files", "shane"])
            )
        );
        assert.deepEqual(
            imm.get("files").toJS(),
            {
                shane: ["test.html"]
            }
        );
    });
    it.only("can register a cb fn for watchers", function (done) {
        var config = {
            files: {
                "css/*.css" : function  () {
                    console.log("hey");
                }
            }
        };
        var imm = merge({
            files: {
                "css/*.css" : function  () {
                    console.log("hey");
                }
            }
        });
        var hooks = require("../../../lib/hooks");
        var out   = hooks["files:watch"]([], imm.get('files'), {});
        require("../../../")(config, function (err, bs) {
            bs.cleanup();
            done();
        })
    });
});
