'use strict';

var module = require('../../lib/index');
var setup = module.setup;

var file1 = "test/fixtures/index.html";
var file2 = "test/fixtures/forms.html";
var file3 = "test/fixtures/scrolling.html";

var css = "test/fixtures/assets/style.css";
var scss = "test/fixtures/scss/main.scss";

var timeoutMsg = "Took too long to access DISK for files";

describe("Browser-sync: transform the files option into useable watchers", function () {

    it("can load", function () {
        expect(setup).toBeDefined();
    });

    describe("accepting a comma separated lists of files", function () {

        var files;
        var cb;

        beforeEach(function(){
            cb = jasmine.createSpy();
        });

        it("should return an array of files", function () {

            files = setup.getFiles("test/fixtures/assets/style.css,test/fixtures/scss/main.scss", cb);

            waits(100);

            runs(function () {
                expect(cb).toHaveBeenCalledWith([css, scss]);
            });
        });
    });
    describe("accepting a comma separated lists of globs", function () {

        var files;
        var cb;

        beforeEach(function(){
            cb = jasmine.createSpy();
        });

        it("should return an array of files", function () {

            files = setup.getFiles("test/fixtures/assets/*.css,test/fixtures/scss/*.scss", cb);

            waitsFor(function () {
                return cb.callCount > 0;
            }, timeoutMsg, 10000);

            runs(function () {
                expect(cb).toHaveBeenCalledWith([css, scss]);
            });
        });
    });

    describe("When getting single files with a string", function () {

        var files;
        var cb;

        beforeEach(function(){
            cb = jasmine.createSpy();
        });

        it("should return an array of files even if only 1 file", function () {

            files = setup.getFiles(file1, cb);

            waitsFor(function () {
                return cb.callCount > 0;
            }, timeoutMsg, 10000);

            runs(function () {
                expect(cb).toHaveBeenCalledWith([file1]);
            });
        });

        it("should return an array of files if an array given", function () {

            files = setup.getFiles([file1, file2], cb);

            waitsFor(function () {
                return cb.callCount > 0;
            }, timeoutMsg, 10000);

            runs(function () {
                expect(cb).toHaveBeenCalledWith([file1, file2]);
            });
        });
    });

    describe("when getting multiple files given as strings", function () {


        describe("When the files DO exist", function () {

            var files = [file1, file2];
            var cb;
            beforeEach(function(){
                cb = jasmine.createSpy("callback1");
            });

            it("should return an array of the files", function () {
                files = setup.getFiles(files, cb);

                waitsFor(function () {
                    return cb.callCount > 0;
                }, timeoutMsg, 10000);

                runs(function () {
                    expect(cb).toHaveBeenCalledWith([file1, file2]);
                });
            });
        });
        describe("When the files DO NOT exist", function () {
//
            var files = ["test/fixtures/index.html", "test/fixtures/kittie.html"];
            var cb;
            beforeEach(function(){
                cb = jasmine.createSpy("callback1");
            });

            it("should return an array of the files", function () {

                files = setup.getFiles(files, cb);
                waitsFor(function () {
                    return cb.callCount > 0;
                }, "Took too long", 10000);

                runs(function () {
                    expect(cb).toHaveBeenCalledWith(["test/fixtures/index.html"]);
                });
            });
        });
    });

    describe("Getting files from a glob", function () {

        var cb;
        var files;
        beforeEach(function(){
            cb = jasmine.createSpy();
        });

        it("should return files from a single glob string", function () {

            files = setup.getFiles("test/fixtures/*.html", cb);

            waitsFor(function () {
                return cb.callCount > 0;
            }, "Took too long to get files", 10000);

            runs(function () {
                expect(cb).toHaveBeenCalledWith([file2, file1, file3]);
            });
        });

        it("should return files from an array of globs", function () {
            files = setup.getFiles([
                "test/fixtures/*.html",
                "test/fixtures/assets/*.css",
                "test/fixtures/scss/*.scss"], cb);

            waitsFor(function () {
                return cb.callCount > 0;
            }, "Took too long to get files!", 10000);

            runs(function () {
                expect(cb).toHaveBeenCalledWith([file2, file1, file3, css, scss]);
            });
        });
    });
});