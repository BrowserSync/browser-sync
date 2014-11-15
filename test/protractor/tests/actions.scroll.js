var init = require("../bs.init");
var path = require("path");
var assert = require("chai").assert;

describe('Scrolling around', function() {
    var ptor     = protractor.getInstance();
    var instance;
    var urls;
    beforeEach(function () {
        browser.ignoreSynchronization = true;
        if (instance) {
            return;
        }
        var config = {
            server: "test/fixtures",
            open: false,
            logLevel: "silent"
        };
        init(protractor, config).then(function (bs) {
            instance = bs;
            urls = instance.getOption("urls");
        });
    });
    it("should know when a client scrolls", function () {

        browser.get(urls.local + "/scrolling.html");
        ptor.executeScript("window.open('%s')".replace("%s", urls.local + "/scrolling.html"));

        browser.getAllWindowHandles().then(function (handles) {
            browser.switchTo().window(handles[0]).then(function () {
                ptor.executeScript("window.scrollBy(0, 100);");
                browser.switchTo().window(handles[1]).then(function () {
                    ptor.executeScript("return window.scrollY").then(function (y) {
                        expect(y < 110 && y > 90).toBe(true);
                        instance.cleanup();
                    });
                });
            });
        });
    });
});