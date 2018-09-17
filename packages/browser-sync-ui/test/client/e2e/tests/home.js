/**
 *
 *
 */

var assert = require("chai").assert;
var init  = require("./../bs-init");

describe("Section Navigation", function() {

    var selector, menu, headerSelector;

    var bs;
    var ui;
    var bsUrl;
    var cpUrl;

    beforeEach(function () {

        browser.ignoreSynchronization = true;
        selector       = '(key, item) in app.ui.menu | orderObjectBy: \'order\'';
        headerSelector = "h1[bs-heading]";

        init(protractor, {
            server: "./test/fixtures",
            open:   false,
            online: false,
            logLevel: "silent"
        }).then(function (out) {
            bs    = out.bs;
            ui    = out.ui;
            bsUrl = bs.options.getIn(["urls", "local"]);
            cpUrl = bs.options.getIn(["urls", "ui"]);
        });
    });

    afterEach(function () {
        bs.cleanup();
    });

    /**
     *
     * Check that the menu is rendered with the correct amount
     * of links/sections
     *
     */
    it("should render the correct amount of links", function() {
        browser.get(cpUrl);

        var flow = protractor.promise.controlFlow();
        var elems = element.all(by.css("[bs-section-nav] li"));

        flow.execute(function () {
            expect(elems.get(0).getText()).toBe("Overview");
            expect(elems.get(1).getText()).toBe("Sync Options");
            expect(elems.get(2).getText()).toBe("History");
        });

        flow.execute(function () {
            elems.get(1).click();
            expect(browser.getCurrentUrl()).toContain('sync-options');
            elems.get(2).click();
            expect(browser.getCurrentUrl()).toContain('history');
            elems.get(3).click();
            expect(browser.getCurrentUrl()).toContain('plugins');
        });
    });

    it("should show the current Browsersync version in header", function() {
        browser.get(cpUrl);
        expect(element(by.css('[bs-link="version"]')).getText()).toBe('v' + bs.options.get('version'));
    });
});
