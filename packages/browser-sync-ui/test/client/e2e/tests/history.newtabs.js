/**
 *
 * E2E tests for the History plugin
 *
 */
var init   = require("./../bs-init");
var utils  = require("./../test-utils");
var assert = require("chai").assert;

describe("History section", function() {

    var bs;
    var ui;
    var bsUrl;
    var cpUrl;

    beforeEach(function () {
        browser.ignoreSynchronization = true;
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

    it("should list visited urls & delete them", function () {

        var elems   = element.all(by.repeater("url in ctrl.visited track by $index"));

        browser.get(cpUrl + "/history");

        expect(elems.count()).toEqual(0);

        utils.openWindow(browser, bsUrl);

        browser.getAllWindowHandles().then(function (handles) {

            var ui = handles[0];
            var client = handles[1];
            var urls = ["/scrolling.html", "/forms.html"];

            browser.sleep(500);
            browser.switchTo().window(client);
            browser.get(bsUrl + urls[0]);
            browser.switchTo().window(ui);
            browser.sleep(500);
            expect(elems.count()).toEqual(2);
            var selector = '[href="%s/scrolling.html"]'.replace('%s', bsUrl);
            expect(elems.get(0).element(by.css(selector)).getText()).toBe('NEW TAB');
        });
    });
});