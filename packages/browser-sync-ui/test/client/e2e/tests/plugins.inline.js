/**
 * Plugins page
 */
var assert = require("chai").assert;
var path   = require("path");
var init   = require("./../bs-init");
var utils  = require("./../test-utils");

describe("Plugins page - with inline BrowserSync plugins", function() {

    var bs;
    var ui;
    var bsUrl;
    var cpUrl;

    beforeEach(function () {

        browser.ignoreSynchronization = true;

        var plugin = {
            module: {
                plugin: function () {

                },
                "plugin:name": "Test Plugin"
            }
        };

        init(protractor, {
            server: "./test/fixtures",
            logLevel: "silent",
            open:   false,
            online: false,
            plugins: [plugin]
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

    it("Should list registered plugins", function() {

        browser.get(cpUrl + "/plugins");
        browser.sleep(500);

        var switchElement = by.id('plugin-section-0');
        var pluginSwitch  = element(by.id("plugin-switch-0"));

        expect(pluginSwitch.isPresent()).toBeTruthy();

        /**
         * Not auto-disabled on page load
         */
        element(switchElement).getAttribute('class').then(function (attr) {
            assert.notInclude(attr, 'disabled');
        });

        /**
         * Assert that BrowserSync reports this plugin as active
         */
        assert.isTrue(bs.getUserPlugins()[1].active);

        /**
         * De-activate by clicking the switch
         */
        element(by.css("label[for='plugin-switch-0']"))
            .click();

        browser.sleep(500);

        var flow     = protractor.promise.controlFlow();

        /**
         * Assert that BrowserSync reports this plugin as inactive
         */
        flow.execute(function () {
            assert.isFalse(bs.getUserPlugins()[1].active);
        });

        /**
         * Refresh and ensure the state is maintained
         */
        browser.get(cpUrl + "/plugins");
        browser.sleep(500);

        /**
         * Assert that the class `disabled` is applied to the element for styling
         */
        expect(element(switchElement).getAttribute('class')).toMatch('disabled');
    });
});
