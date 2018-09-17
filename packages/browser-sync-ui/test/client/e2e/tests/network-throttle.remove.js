/**
 * Remote debug page
 */
var assert = require("chai").assert;
var init  = require("./../bs-init");
var utils  = require("./../test-utils");

describe("Network throttle page", function() {

    var bs;
    var ui;
    var bsUrl;
    var cpUrl;

    beforeEach(function () {

        browser.ignoreSynchronization = true;

        init(protractor, {
            server: "./test/fixtures",
            logLevel: "silent",
            open:   false,
            online: false
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

    it("Should allow servers removed when bin icon clicked", function() {

        browser.get(cpUrl + "/network-throttle");

        browser.sleep(1000);

        var createServerBtn = by.id("create-server");

        element(createServerBtn).click();

        browser.sleep(1000);

        var flow     = protractor.promise.controlFlow();

        var serverList = element(by.id("throttle-server-list"));
        var listItem   = serverList.all(by.tagName("li"));
        expect(listItem.count()).toBe(1);

        listItem
            .get(0)
            .all(by.tagName("BUTTON"))
            .get(0)
            .click();

        expect(listItem.count()).toBe(0);
    });
});