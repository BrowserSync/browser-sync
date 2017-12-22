var browserSync = require("../../../");

var sinon = require("sinon");
var request = require("supertest");
var assert = require("chai").assert;

var config = {
    server: {
        baseDir: "test/fixtures"
    },
    logLevel: "silent",
    open: false
};

describe("Plugins: Registering Hooks:", function() {
    var instance;
    var initSpy;
    var mwSpy1;
    var mwSpy2;

    before(function(done) {
        browserSync.reset();
        initSpy = sinon.spy();
        mwSpy2 = sinon.spy(function(res, req, next) {
            next();
        });
        mwSpy1 = sinon.spy(function(res, req, next) {
            next();
        });

        browserSync.use({
            plugin: initSpy,
            hooks: {
                "client:events": function() {
                    return "cp:goto";
                },
                "client:js": function() {
                    return "SHANE123456";
                },
                "server:middleware": function() {
                    return [mwSpy2, mwSpy1];
                }
            }
        });

        instance = browserSync.init(config, done).instance;
    });

    afterEach(function() {
        initSpy.reset();
    });

    after(function() {
        instance.cleanup();
    });
    it("calls the function returned from the plugin method", function() {
        sinon.assert.calledOnce(initSpy); // the plugin init method
    });
    it("adds an item to the clientEvents array", function() {
        assert.include(instance.options.get("clientEvents").toJS(), "cp:goto");
    });
    it("adds an item to the Server Middleware array (2)", function(done) {
        request(instance.server)
            .get("/")
            .expect(200)
            .end(function() {
                sinon.assert.calledOnce(mwSpy1);
                sinon.assert.calledOnce(mwSpy2);
                done();
            });
    });
});

describe("Plugins: Registering hooks - client events:", function() {
    var instance;

    before(function(done) {
        browserSync.reset();
        browserSync.use({
            plugin: function() {},
            hooks: {
                "client:events": function() {
                    return ["cp:goto", "custom:event"];
                }
            }
        });

        instance = browserSync.init(config, function() {
            done();
        }).instance;
    });
    after(function() {
        instance.cleanup();
    });
    it("adds multiple items to the clientEvents array", function() {
        assert.include(instance.options.get("clientEvents").toJS(), "cp:goto");
        assert.include(
            instance.options.get("clientEvents").toJS(),
            "custom:event"
        );
    });
});

describe("Plugins: Registering hooks - server middleware", function() {
    var instance, mwSpy1;

    before(function(done) {
        browserSync.reset();

        mwSpy1 = sinon.spy(function(res, req, next) {
            next();
        });

        browserSync.use({
            plugin: function() {},
            hooks: {
                "server:middleware": function() {
                    return mwSpy1;
                }
            }
        });

        instance = browserSync(config, done).instance;
    });
    after(function() {
        instance.cleanup();
    });
    it("Calls the middleware function", function(done) {
        request(instance.server)
            .get("/")
            .expect(200)
            .end(function() {
                sinon.assert.called(mwSpy1);
                done();
            });
    });
});
