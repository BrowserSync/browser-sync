"use strict";

var index = require("../../../lib/index");
var cliUtils = require("../../../lib/cli").utils;
var assert = require("chai").assert;

describe("BrowserSync CLI Transforming the files option:", function () {
    it("can load", function () {
        assert.isDefined(cliUtils);
    });
    describe("when accepting a comma separated lists of patterns (files)", function () {
        var files;

        beforeEach(function () {
            var arg = "test/fixtures/assets/style.css,test/fixtures/scss/main.scss";
            files = cliUtils.getFiles(arg);
        });

        it("should return an array of patterns", function () {
            assert.equal(files.length, 2);
        });
        it("should return an array of patterns (2)", function () {
            assert.equal(files[0], "test/fixtures/assets/style.css");
        });
        it("should return an array of patterns (3)", function () {
            assert.equal(files[1], "test/fixtures/scss/main.scss");
        });
    });
    describe("when accepting a comma separated lists of globs", function () {

        var files;

        beforeEach(function(){
            var arg = "test/fixtures/assets/*.css,test/fixtures/scss/*.scss";
            files = cliUtils.getFiles(arg);
        });

        it("should return an array of file globs", function () {
            assert.equal(files.length, 2);
        });
        it("should return an array of file globs (2)", function () {
            assert.equal(files[0], "test/fixtures/assets/*.css");
        });
        it("should return an array of file globs (3)", function () {
            assert.equal(files[1], "test/fixtures/scss/*.scss");
        });
    });
    describe("When accepting a single pattern", function () {
        it("should return the pattern", function () {
            var arg = "test/fixtures/assets/*.css";
            var files = cliUtils.getFiles(arg);
            assert.equal(files, arg);
        });
    });
    describe("when accepting an array of patterns", function () {
        it("should return the array unchanged", function () {
            var arg = ["**/*.css", "*.html"];
            var files = cliUtils.getFiles(arg);
            assert.equal(files, arg);
        });
    });
    describe("when accepting an array of patterns with a single item", function () {
        it("should return the pattern", function () {
            var arg = ["**/*.css"];
            var files = cliUtils.getFiles(arg);
            assert.equal(files, arg);
        });
    });
    describe("when an empty string is given", function () {
        it("should return false", function () {
            var arg = "";
            var files = cliUtils.getFiles(arg);
            assert.isFalse(files);
        });
    });
});