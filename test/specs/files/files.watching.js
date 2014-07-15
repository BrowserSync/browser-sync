"use strict";

var messages    = require("../../../lib/messages");
var fileWatcher = require("../../../lib/file-watcher");

var events      = require("events");
var Gaze        = require("gaze").Gaze;
var assert      = require("chai").assert;
var sinon       = require("sinon");

var testFile1   = "test/fixtures/test.txt";
var testFile2   = "test/fixtures/test2.txt";

describe("File Watcher Module", function () {

});