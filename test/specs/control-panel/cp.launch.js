"use strict";

var controlPanel = require("../../../lib/control-panel");
var messages     = require("../../../lib/messages");

var assert       = require("chai").assert;
var request      = require("supertest");
var sinon        = require("sinon");

var clientJS = messages.clientScript({version:"2.3.4"});

describe("Launching the Control panel", function () {

    var app;
    var options;

    before(function () {
        options = {
            devMode: false,
            version: "2.3.4"
        };
        var spy = function (req, res) {
            res.end("CONTENT"); // stub the client scripts
        };
        app = controlPanel.launchControlPanel("ScriptTags", options, spy);
    });

    it("should return the client script", function (done) {
        request(app)
            .get(clientJS)
            .expect(200)
            .end(function (err, res) {
                var actual = res.text.indexOf("CONTENT");
                assert.isTrue(actual >= 0);
                done();
            });
    });
});
