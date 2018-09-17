
var init = require("../bs.init");

describe("works when base url set in HTML", function () {
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
            https: true,
            open: false,
            logLevel: "silent",
            scriptPath: function (path, port, options) {
                return options.get("absolute");
            },
            ui: false
        };
        init(protractor, config).then(function (bs) {
            instance = bs;
            urls = instance.getOption("urls").toJS();
        });
    });
    it("should ", function () {

        browser.get(urls.local + "/base.html");

        assertScripts();
    });
});

function assertScripts () {
    expect(element(by.id("__bs_script__")).isPresent()).toBeTruthy();
    expect(element(by.id("__bs_notify__")).isPresent()).toBeTruthy();
}
