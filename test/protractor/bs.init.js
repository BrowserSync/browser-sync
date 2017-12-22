
var bs = require("../../");

module.exports = function (protractor, config) {
    var flow = protractor.promise.controlFlow();
    var deferred = protractor.promise.defer();
    return flow.execute(function () {
        bs.create().init(config, function (err, _bs) {
            deferred.fulfill(_bs);
        });
        return deferred.promise;
    });
};
