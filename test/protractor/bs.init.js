"use strict";

var bs = require("../../");

module.exports = function (protractor, config) {
    var flow = protractor.promise.controlFlow();
    var deferred = protractor.promise.defer();
    return flow.execute(function () {
        bs(config, function (err, bs) {
            deferred.fulfill(bs);
        });
        return deferred.promise;
    });
};
