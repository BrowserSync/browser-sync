"use strict";

var init = require("../bs.init");

describe("works with Socket IO on same page", function () {
    var ptor     = protractor.getInstance();
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
            logLevel: "silent"
        };
        init(protractor, config).then(function (bs) {
            instance = bs;
            urls = instance.getOption("urls").toJS();
        });
    });
    it("should leave window.io available to others people", function () {
        browser.get(urls.local + "/socket.io.html");
        assertScripts();
        ptor.executeScript("return typeof window.io;").then(function (io) {
            expect(io).toBe("function");
        });
    });
});

function assertScripts () {
    expect(element(by.id("__bs_script__")).isPresent()).toBeTruthy();
    expect(element(by.id("__bs_notify__")).isPresent()).toBeTruthy();
}
