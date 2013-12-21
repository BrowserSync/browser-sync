/**
 * Created by shakyshane on 18/09/2013.
 */
describe("Style Injector INIT", function () {

    var bs;
    var scope;
    var methods;

    beforeEach(function(){
        bs = window.bs;
        methods = bs;
        scope = {};
    });

    it("should be accessible on the window for testing", function () {
        assert.isDefined(bs);
    });

//    describe("when accepting options", function () {
//
//        var options;
//        beforeEach(function(){
//            spyOn(methods, "initGhostMode");
//            options = {
//                ghostMode: {
//                    links: true,
//                    scroll: true,
//                    forms: true
//                }
//            };
//            methods.processOptions(scope, options);
//        });
//
//        it("can accept options", function () {
//            expect(scope.options.ghostMode).toBeTruthy();
//        });
//
//        describe("initialising ghost-mode", function () {
//
//            it("can set up ghost mode", function () {
//
//                expect(methods.initGhostMode).toHaveBeenCalled();
//            });
//        });
//    });
});
