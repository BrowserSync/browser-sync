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

    it("Should allow servers to be created with auto port", function() {

        browser.get(cpUrl + "/network-throttle");
        browser.sleep(1000);

        var items = element.all(by.repeater("(key, item) in ctrl.throttle.targets | orderObjectBy:'order'"));

        expect(items.count()).toBe(6);

        var createServerBtn = by.id("create-server");

        expect(element(createServerBtn).isPresent()).toBeTruthy();

        element(createServerBtn).click();

        browser.sleep(1000);

        var flow     = protractor.promise.controlFlow();

        flow.execute(function () {

            var serverList = element(by.id("throttle-server-list"));
            var listItem   = serverList.all(by.tagName("li"));

            expect(listItem.count()).toBe(1);

            listItem
                .get(0)
                .all(by.tagName("p"))
                .get(2)
                .getText()
                .then(utils.openWindow.bind(null, browser));

            browser.sleep(1000);

            browser.getAllWindowHandles().then(function (handles) {
                var ui     = handles[0];
                var client = handles[1];
                browser.switchTo().window(client);
                expect(element(by.id("__bs_script__")).isPresent()).toBeTruthy();
            });
        });
    });
});