/**
 *
 NONE Angular site
 browser.ignoreSynchronization = true;
 browser.get('http://localhost:8000/login.html');

 element(by.id('username')).sendKeys('Jane');
 element(by.id('password')).sendKeys('1234');
 element(by.id('clickme')).click();
 *
 */

describe('Server Info section', function() {

    var expected, selector, menu, bsUrl;
    var ptor = protractor.getInstance();
    var url;

    beforeEach(function () {
        browser.ignoreSynchronization = true;
        browser.get("/");
        bsUrl     = process.env["BS_URL"];
        selector  = '(key, item) in ui.menu | orderObjectBy: \'order\'';
    });

    /**
     * Look at the list of urls &
     * 1. assert that the correct number are there
     * 2. assert that the first one contains the `local` BrowserSync url
     */
    it("List items should contain the relevant information", function () {

        var elements = element.all(by.repeater("url in urls"));

        elements.count().then(function (count) {
            expect(count).toEqual(1);
        });

        element(by.repeater("url in urls").row(0)).getInnerHtml().then(function (out) {
            expect(out.indexOf(bsUrl) > -1).toBeTruthy();
        });
    });
    it("should render the icon", function () {

        var elements = element.all(by.css("[bs-callout] [bs-icon='computer_download']"));

        elements.count().then(function (count) {
            expect(count).toEqual(1);
        });
    });
    it("should have a link for opening new tab", function () {

        var elements = element.all(by.css("[bs-Content] a[title='Launch new tab here'")).then(function (links) {
            links[0].getAttribute("href").then(function (out) {
                expect(out.indexOf(bsUrl) > -1).toBeTruthy();
            });
            links[0].getAttribute("target").then(function (out) {
                expect(out).toEqual("_blank");
            });
        });
    });
});