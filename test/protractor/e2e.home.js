/**
 *
 */
describe('Section Navigation', function() {
    var ptor = protractor.getInstance();
    beforeEach(function () {
        browser.ignoreSynchronization = true;
        browser.get("/");
    });
    it("should contain the BS script element", function () {
        expect(element(by.id('__bs_script__')).isPresent()).toBeTruthy();
    });
    it("should contain the BS NOTIFY ELEMENT", function () {
        expect(element(by.id('__bs_notify__')).isPresent()).toBeTruthy();
    });
});