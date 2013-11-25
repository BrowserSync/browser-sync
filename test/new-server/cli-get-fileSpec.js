'use strict';

var module = require('../../lib/index');
var setup = module.setup;

describe("Browser-sync: transform the files option into useable watchers", function () {

    it("can load", function () {
        expect(setup).toBeDefined();
    });

    describe("accepting a comma separated lists of patterns (files)", function () {

        var files;
        beforeEach(function () {
            var arg = "test/fixtures/assets/style.css,test/fixtures/scss/main.scss";
            files = setup.getFiles(arg);
        });
        it("should return an array of patterns", function () {
            expect(files.length).toBe(2);
        });
        it("should return an array of patterns (2)", function () {
            expect(files[0]).toBe("test/fixtures/assets/style.css");
        });
        it("should return an array of patterns (3)", function () {
            expect(files[1]).toBe("test/fixtures/scss/main.scss");
        });
    });
    describe("accepting a comma separated lists of globs", function () {

        var files;

        beforeEach(function(){
            var arg = "test/fixtures/assets/*.css,test/fixtures/scss/*.scss";
            files = setup.getFiles(arg);
        });

        it("should return an array of file globs", function () {
            expect(files.length).toBe(2);
        });
        it("should return an array of file globs (2)", function () {
            expect(files[0]).toBe("test/fixtures/assets/*.css");
        });
        it("should return an array of file globs (3)", function () {
            expect(files[1]).toBe("test/fixtures/scss/*.scss");
        });
    });

    describe("accepting a single pattern", function () {

        var files, arg
        beforeEach(function(){
            arg = "test/fixtures/assets/*.css";
            files = setup.getFiles(arg);
        });
        it("should return the pattern", function () {
            expect(files).toBe(arg);
        });
    });
    describe("accepting an array of patterns", function () {

        var files, arg
        beforeEach(function(){
            arg = ["**/*.css", "*.html"];
            files = setup.getFiles(arg);
        });
        it("should return the pattern", function () {
            expect(files).toBe(arg);
        });
    });
    describe("accepting an array of patterns (2)", function () {

        var files, arg
        beforeEach(function(){
            arg = ["**/*.css"];
            files = setup.getFiles(arg);
        });
        it("should return the pattern", function () {
            expect(files).toBe(arg);
        });
    });
    describe("returning false if empty string given", function () {

        var files, arg;
        beforeEach(function(){
            arg = "";
            files = setup.getFiles(arg);
        });
        it("should return false", function () {
            expect(files).toBe(false);
        });
    });
});