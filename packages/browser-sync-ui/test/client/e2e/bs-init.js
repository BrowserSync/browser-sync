module.exports = function (ptor, config) {

    var flow     = ptor.promise.controlFlow();
    var deferred = ptor.promise.defer();

    var bs       = require("browser-sync").create("Test Instance");

    bs.use(require("../../../"));

    return flow.execute(function () {
        bs.init(config, function (err, _bs) {
            deferred.fulfill({
                ui: _bs.ui,
                bs: _bs
            });
        });

        return deferred.promise;
    });
};