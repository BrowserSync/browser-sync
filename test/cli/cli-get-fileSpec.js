"use strict";

var index = require("../../lib/index");
var cliUtils = require("../../lib/cli").utils;
var assert = require("chai").assert;

describe("Browser-sync: transform the files option into useable watchers", function () {

    it("can load", function () {
        assert.isDefined(cliUtils);
    });

    describe("accepting a comma separated lists of patterns (files)", function () {

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
    describe("accepting a comma separated lists of globs", function () {

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

    describe("accepting a single pattern", function () {

        var files, arg;
        beforeEach(function(){
            arg = "test/fixtures/assets/*.css";
            files = cliUtils.getFiles(arg);
        });
        it("should return the pattern", function () {
            assert.equal(files, arg);
        });
    });
    describe("accepting an array of patterns", function () {

        var files, arg;
        beforeEach(function(){
            arg = ["**/*.css", "*.html"];
            files = cliUtils.getFiles(arg);
        });
        it("should return the pattern", function () {
            assert.equal(files, arg);
        });
    });
    describe("accepting an array of patterns (2)", function () {

        var files, arg;
        beforeEach(function(){
            arg = ["**/*.css"];
            files = cliUtils.getFiles(arg);
        });
        it("should return the pattern", function () {
            assert.equal(files, arg);
        });
    });
    describe("returning false if empty string given", function () {

        var files, arg;
        beforeEach(function(){
            arg = "";
            files = cliUtils.getFiles(arg);
        });
        it("should return false", function () {
            assert.isFalse(files);
        });
    });
});