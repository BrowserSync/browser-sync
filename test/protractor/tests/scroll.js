var init = require("../bs.init");
var path = require("path");

describe('Page Navigation', function() {
    var ptor     = protractor.getInstance();
    var instance;
    var urls;
    beforeEach(function () {
        browser.ignoreSynchronization = true;
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
    it("should contain the BS script & notify element", function () {
        browser.get(urls.local);
        [
            "scrolling.html",
            "index-large.html",
            "index-amd.html"
        ].forEach(function (url) {
            browser.get(path.join(urls.local, url));
            assertScripts();
        });
    });
    it("should navigate to other pages", function () {
        browser.get(urls.local + "/scrolling.html");
        assertScripts();
    });
});

function assertScripts () {
    expect(element(by.id('__bs_script__')).isPresent()).toBeTruthy();
    expect(element(by.id('__bs_notify__')).isPresent()).toBeTruthy();
}