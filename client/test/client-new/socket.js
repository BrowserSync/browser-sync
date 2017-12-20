describe("Socket Connection", function () {

    var socket = window.__bs_socket__;
    var event = "event";
    var data  = {name: "shane"};
    var spyOn;
    var spyEmit;
    before(function () {
        spyOn   = sinon.spy(socket.socket, "on");
        spyEmit = sinon.spy(socket.socket, "emit");
    });
    afterEach(function () {
        spyEmit.reset();
    });

    it("should add a listener", function () {
        socket.on(event, data);
        sinon.assert.calledWithExactly(spyOn, event, data);
    });
    it("should emit an event with data", function () {
        socket.emit(event, data);
        sinon.assert.calledWithExactly(spyEmit, event, data);
    });
    it("should send the path when emitting", function () {
        var stub  = sinon.stub(socket, "getPath").returns("/index.html");
        socket.emit(event, data);
        var actual   = spyEmit.getCall(0).args[1].url;
        var expected = "/index.html";
        assert.equal(actual, expected);
        stub.restore();
    });
});