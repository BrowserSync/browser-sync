"use strict";

var init = require("../bs.init");

describe("Scrolling around", function () {
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
    it("should mirror clicks on hrefs", function () {

        browser.get(urls.local + "/scrolling.html");
        ptor.executeScript("window.open('%s')".replace("%s", urls.local + "/scrolling.html"));

        browser.getAllWindowHandles().then(function (handles) {
            browser.switchTo().window(handles[0]).then(function () {
                element(by.css("a")).click(); // go to the link
                browser.switchTo().window(handles[1]).then(function () {
                    expect(ptor.getCurrentUrl()).toContain("index.html");
                    instance.cleanup();
                });
            });
        });
    });
});
