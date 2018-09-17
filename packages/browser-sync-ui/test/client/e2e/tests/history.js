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
            var emptyContainer = "#bs-history-empty";
            var listContainer  = "#bs-history-list";
            var selector = by.css(listContainer + " li > div > [bs-remove]");
            var deleteButtons = element.all(selector);

            browser.sleep(500);
            browser.switchTo().window(client);
            browser.get(bsUrl + urls[0]);
            browser.switchTo().window(ui);
            browser.sleep(500);
            expect(elems.count()).toEqual(2);
            browser.switchTo().window(client);
            browser.get(bsUrl + urls[1]);
            browser.switchTo().window(ui);
            browser.sleep(500);
            expect(elems.count()).toEqual(3);
            expect(element.all(by.css(emptyContainer)).count()).toBe(0);
            deleteButtons.get(0).click();
            browser.sleep(1000);
            expect(elems.count()).toEqual(2);
            deleteButtons.get(0).click();
            browser.sleep(1000);
            expect(elems.count()).toEqual(1);
            deleteButtons.get(0).click();
            browser.sleep(1000);
            expect(elems.count()).toEqual(0);
            expect(element.all(by.css(listContainer + " li")).count()).toBe(0);
            expect(element.all(by.css(emptyContainer)).count()).toBe(1);

            // Test the "SYNC ALL" buttons on each list item
            browser.switchTo().window(client);
            browser.get(bsUrl + urls[0]);
            browser.get(bsUrl + urls[1]);
            browser.get(bsUrl);
            browser.sleep(1000);
            browser.switchTo().window(ui);
            expect(element.all(by.css(listContainer + " li")).count()).toBe(3);
            element.all(by.css(listContainer + " li > div > a"))
                .get(1)
                .click();
            browser.sleep(500);
            browser.switchTo().window(client);

            browser.getCurrentUrl().then(function (url) {
                var match = url.match(new RegExp(bsUrl + "\\/?"));
                assert.isTrue(match.length > 0);
            });

            // Test the "clear all" button
            browser.switchTo().window(ui);
            element.all(by.css('[bs-button-row] [bs-button~="inline"]'))
                .get(0)
                .click();
            browser.sleep(1000);
            expect(elems.count()).toEqual(0);
        });
    });
});