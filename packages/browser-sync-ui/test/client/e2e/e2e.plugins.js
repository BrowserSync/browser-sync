/**
 *
 * E2E tests for the plugins page
 *
 */
var assert = require("chai").assert;

describe('Plugins section', function() {

    var expected, selector, menu, bsUrl;
    var ptor = protractor.getInstance();
    var url;

    beforeEach(function () {
        browser.ignoreSynchronization = true;
        browser.get("/plugins");
        bsUrl     = process.env["BS_URL"];
    });
    it("should list the form sync options", function () {
        expect(element.all(by.repeater("plugin in ui.plugins")).count()).toBe(1);
    });
});