var bs = require("../../lib/browser-sync");
var controlPanel = require("../../lib/control-panel");
var messages = require("../../lib/messages");
var assert = require("chai").assert;
var request = require("supertest");

var respString = "}(window, (typeof ___socket___ === \"undefined\") ? {} : ___socket___));";
var clientJS = messages.clientScript({version:"2.3.4"});

describe("Launching the Control panel", function () {

    var app;
    var options;

    before(function () {
        options = {
            devMode: false,
            version: "2.3.4"
        };
        app = controlPanel.launchControlPanel("ScriptTags", options);
    });

    it("should return the client script", function (done) {
        request(app)
            .get(clientJS)
            .expect(200)
            .expect('Content-Type', /javascript/)
            .end(function (err, res) {
                var actual = res.text.indexOf(respString);
                assert.isTrue(actual >= 0);
                done();
            });
    });
});
