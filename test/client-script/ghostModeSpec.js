describe("Ghost Mode: Utils", function () {

    var ghost;
    var locationStub;

    beforeEach(function () {
        ghost = window.ghost;
        locationStub = sinon.stub(ghost, "getCurrentPath").returns("/path");
    });
    afterEach(function () {
        locationStub.restore();
    });

    it("should allow syncing if Paths match", function () {
        var actual = ghost.canSync("/path");
        assert.equal(actual, true);
    });
    it("should not allow syncing if Paths do not match", function () {
        var actual = ghost.canSync("/path2");
        assert.equal(actual, false);
    });
});