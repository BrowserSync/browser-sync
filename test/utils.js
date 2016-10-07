var Rx = require('rx');
var request     = require("supertest");

module.exports.getScheduler = function () {
    var Rx = require('rx');
    return new Rx.TestScheduler();
};

module.exports.getRequests = function (reqs, server) {
    return reqs.map(function (req) {
        return Rx.Observable.create(function (obs) {
            if (typeof req === 'function') {
                try {
                    req();
                } catch (e) {
                    obs.onError(e);
                    return;
                }
                process.nextTick(function () {
                    obs.onNext(true);
                    obs.onCompleted(true);
                });
                return;
            }
            request(server)
                .get(req[0])
                .set('accept', 'text/html')
                .end(function (err, res) {
                    if (err) {
                        return obs.onError(err);
                    }
                    if (res.text === req[1]) {
                        obs.onNext(true);
                        obs.onCompleted();
                        return;
                    }

                    var errorMessage = [
                        req[0] + " did not match the response body",
                          'actual:   ' + res.text,
                          'expected: ' + req[1]
                    ];

                    obs.onError(new Error(errorMessage.join('\n')));
                });
        });
    });
};
