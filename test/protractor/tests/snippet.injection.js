
/**
 *
 */
// abstract writing screen shot to a file
//var fs = require("fs");
//var slugify = require("slugify");
//function writeScreenShot(data, filename) {
//    var stream = fs.createWriteStream(filename);
//    stream.write(new Buffer(data, "base64"));
//    stream.end();
//}

/**
 *
 */
describe("Section Navigation", function () {
    beforeEach(function () {
        browser.ignoreSynchronization = true;
        browser.get("/");
    });
    it("should contain the BS script element", function () {
        expect(element(by.id("__bs_script__")).isPresent()).toBeTruthy();
    });
    it("should contain the BS NOTIFY ELEMENT", function () {
        //browser.pause();
        expect(element(by.id("__bs_notify__")).isPresent()).toBeTruthy();
    });
    it("should launch UI", function () {
        browser.ignoreSynchronization = false;
        browser.get(process.env["BS_UI"]);
        expect(element.all(by.css("[bs-heading]")).get(0).isPresent()).toBeTruthy();
    });
});
