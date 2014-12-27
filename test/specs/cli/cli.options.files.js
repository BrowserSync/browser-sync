"use strict";

var cli             = require("../../../lib/cli/");
var Immutable       = require("immutable");
var options         = cli.options;
var callbacks       = options.callbacks;
var merge           = cli.options.merge;

var assert = require("chai").assert;

describe.only("CLI: Options: Merging Options: Files", function () {
    it("should return the files property from string", function () {
        var imm = merge({files: ["css/*.css"]});
        assert.deepEqual(imm.get("files").toJS(), ["css/*.css"]);
    });
    it("should return the files property from string", function () {
        var imm = merge({}, {
            files: "css/*.css, *.html"
        });
        assert.deepEqual(
            imm.get("files").toJS(),
            ["css/*.css", "*.html"]
        );
    });
    it("should return the files property from string", function () {
        var imm = merge({}, {
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
    it("should return the files property Merged with excluded array (cli)", function () {
        var imm = merge({}, {
            files: "css/*.css, *.html",
            exclude: "node_modules"
        });
        assert.deepEqual(
            imm.get("files").toJS(),
            ["css/*.css", "*.html", "!node_modules/**"]
        );
    });
    it("should return the files property Merged with excluded array (cli)", function () {
        var imm = merge({}, {
            files: "css/*.css, *.html",
            exclude: ["node_modules"]
        });
        assert.deepEqual(
            imm.get("files").toJS(),
            ["css/*.css", "*.html", "!node_modules/**"]
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
});
