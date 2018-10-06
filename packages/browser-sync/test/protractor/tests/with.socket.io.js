
var init = require("../bs.init");

describe("works with Socket IO on same page", function () {
    var instance;
    var urls;
    beforeEach(function () {
        browser.ignoreSynchronization = true;
        if (instance) {
            return;
        }
        var config = {
            server: {
                baseDir: "test/fixtures",
                routes: {
                    "/lib": "./lib"
                }
            },
            open: false,
            logLevel: "silent",
            ui: false
        };
        init(protractor, config).then(function (bs) {
            instance = bs;
            urls = instance.getOption("urls").toJS();
        });
    });
    it("should leave window.io available to others people", function () {

        browser.get(urls.local + "/socket.io.html");

        assertScripts();

        browser.sleep(1000);

        browser.executeScript("return typeof window.io;").then(function (io) {

            expect(io).toBe("function");

            var flow = protractor.promise.controlFlow();

            flow.execute(function () {
                instance.cleanup();
            });
        });
    });
});

function assertScripts () {
    expect(element(by.id("__bs_script__")).isPresent()).toBeTruthy();
    expect(element(by.id("__bs_notify__")).isPresent()).toBeTruthy();
}
