/**
 * Created by shakyshane on 18/09/2013.
 */

describe("Style Injector INIT", function () {

    var si;
    var scope;
    var methods;

    beforeEach(function(){
        si = window.browserSync;
        methods = si;
        scope = {};
    });

    it("should be accessible on the window for testing", function () {
        expect(si).toBeDefined();
    });

    describe("when accepting options", function () {

        var options;
        beforeEach(function(){
            spyOn(methods, "initGhostMode");
            options = {
                ghostMode: {
                    links: true,
                    scroll: true,
                    forms: true
                }
            };
            methods.processOptions(scope, options);
        });

        it("can accept options", function () {
            expect(scope.options.ghostMode).toBeTruthy();
        });

        describe("initialising ghost-mode", function () {

            it("can set up ghost mode", function () {

                expect(methods.initGhostMode).toHaveBeenCalled();
            });
        });
    });
});
