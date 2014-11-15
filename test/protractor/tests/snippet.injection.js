/**
 *
 */
// abstract writing screen shot to a file
var fs = require('fs');
var slugify = require('slugify');
function writeScreenShot(data, filename) {
    var stream = fs.createWriteStream(filename);
    stream.write(new Buffer(data, 'base64'));
    stream.end();
}

/**
 *
 */
describe('Section Navigation', function() {
    var ptor = protractor.getInstance();
    beforeEach(function () {
        browser.ignoreSynchronization = true;
        browser.get("/");
        // within a test:
        browser.takeScreenshot().then(function (png) {
            writeScreenShot(png, "screenshots/ss_" + slugify(process.env["BS_TEST_NAME"]) + ".png");
        });
    });
    it("should contain the BS script element", function () {
        process.emit("BS_EMIT", {"name": "shane"});
        expect(element(by.id('__bs_script__')).isPresent()).toBeTruthy();
    });
    it("should contain the BS NOTIFY ELEMENT", function () {
        expect(element(by.id('__bs_notify__')).isPresent()).toBeTruthy();
    });
});