
var init = require("../bs.init");
var path = require("path");

describe("Interactions on Server Pages", function () {
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
            urls = instance.getOption("urls").toJS();
        });
    });
    it("should contain the BS script & notify element", function () {
        browser.get(urls.local);
        [
            "scrolling.html",
            "index-large.html",
            "index-amd.html"
        ].forEach(function (url) {
            browser.get(path.join(urls.local, url));
            browser.sleep(500);
            assertScripts();
        });
    });
    it("should know when a client scrolls", function () {
        instance.io.sockets.on("connection", function (client) {
            client.on("scroll", function (data) {
                expect(data.position.raw.y).toBe(100);
            });
            client.on("click", function (data) {
                expect(data.tagName).toEqual("A");
                expect(data.index).toEqual(0);
                expect(data.url).toEqual("/scrolling.html");
            });
        });

        browser.get(urls.local + "/scrolling.html");
        browser.executeScript("window.scrollBy(0, 100);");
        var elem = element(by.css("a"));
        elem.click();
    });

    it("should know when a client is filling a form", function () {

        instance.io.sockets.on("connection", function (client) {
            var keyCount = 0;
            client.on("input:text", function (data) {
                if (data.value === "Hi there") {
                    expect(data.tagName).toEqual("INPUT");
                    expect(data.index).toEqual(0);
                    expect(data.url).toEqual("/forms.html");
                    expect(keyCount).toEqual(8);
                }
                keyCount += 1;
            });
        });

        browser.get(urls.local + "/forms.html");
        element(by.id("name")).sendKeys("Hi there");
        instance.cleanup();

    });
});

function assertScripts () {
    expect(element(by.id("__bs_script__")).isPresent()).toBeTruthy();
    expect(element(by.id("__bs_notify__")).isPresent()).toBeTruthy();
}
