
var init = require("../bs.init");

describe("Scrolling around", function () {
    beforeEach(function () {
        browser.ignoreSynchronization = true;
    });
    it("should know when a client scrolls", function () {
        var instance;
        var urls;
        var config = {
            server: "test/fixtures",
            open: false,
            logLevel: "silent",
            ui: false
        };
        //browser.pause();

        init(protractor, config).then(function (bs) {

            instance = bs;
            urls = instance.getOption("urls").toJS();

        }).then(function () {

            browser.get(urls.local + "/scrolling.html");
            browser.executeScript("window.open('%s')".replace("%s", urls.local + "/scrolling.html"));

            browser.getAllWindowHandles().then(function (handles) {
                browser.switchTo().window(handles[1]).then(function () {
                    browser.executeScript("window.scrollBy(0, 100);");
                    browser.close();
                    browser.sleep(1000);
                    browser.switchTo().window(handles[0]).then(function () {
                        browser.executeScript("return window.scrollY").then(function (y) {

                            var flow = protractor.promise.controlFlow();

                            flow.execute(function () {
                                instance.cleanup();
                            });

                            expect(y < 110 && y > 90).toBe(true);
                        });
                    });
                });
            });
        });
    });
});
