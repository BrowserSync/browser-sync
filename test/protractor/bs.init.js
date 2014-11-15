var bs = require("../../index");

module.exports = function (protractor, config, cb) {
    var flow = protractor.promise.controlFlow();
    var deferred = protractor.promise.defer();
    return flow.execute(function () {
        bs(config, function (err, bs) {
            deferred.fulfill(bs);
        })
        return deferred.promise;
    });
};