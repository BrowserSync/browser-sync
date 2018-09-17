/**
 *
 * E2E tests for the sync-options plugin
 *
 */
describe('Sync options section', function() {

    var expected, selector, menu, bsUrl;
    var ptor = protractor.getInstance();
    var url;

    beforeEach(function () {
        browser.ignoreSynchronization = true;
        browser.get("/sync-options");
        bsUrl     = process.env["BS_URL"];
    });

    it("should list the sync options", function () {

        selector  = 'item in syncItems';

        var elements = element.all(by.repeater(selector));

        elements.count().then(function (count) {
            expect(count).toEqual(2);
        });
    });
    it("should list the switches in sync options", function () {

        selector  = 'item in syncItems';

        var elements = element.all(by.repeater(selector));
        var selector = '[bs-callout-content] [bs-text=\"lede\"]';

        // Check the headings exist
        elements.then(function (elems) {
            getItemText(elems[0], selector, "Clicks");
            getItemText(elems[1], selector, "Scroll");
        });

        //
        elements.then(function (elems) {
            expect(elems[0].element(by.css("#cmn-sync-0")).isPresent()).toBe(true);
            expect(elems[1].element(by.css("#cmn-sync-1")).isPresent()).toBe(true);
        });

        function getItemText(elem, selector, expected) {
            elem.element(by.css(selector)).then(function (item) {
                expect(item.getText()).toEqual(expected);
            });
        }
    });
    it("should list the switches in sync options", function () {

        selector  = 'item in formItems';

        var elements = element.all(by.repeater(selector));
        var selector = '[bs-callout-content] [bs-text=\"lede\"]';

        // Check the headings exist
        elements.then(function (elems) {
            getItemText(elems[0], selector, "Submit");
            getItemText(elems[1], selector, "Inputs");
            getItemText(elems[2], selector, "Toggles");
        });


        elements.then(function (elems) {
            elems.forEach(function (elem, i) {
                expect(elem.element(by.css("#cmn-form-" + i)).isPresent()).toBe(true);
            });
        });

        function getItemText(elem, selector, expected) {
            elem.element(by.css(selector)).then(function (item) {
                expect(item.getText()).toEqual(expected);
            });
        }
    });
    it("should list the form sync options", function () {

        selector  = 'item in formItems';

        var elements = element.all(by.repeater(selector));

        elements.count().then(function (count) {
            expect(count).toEqual(3);
        });
    });
});