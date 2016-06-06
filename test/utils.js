module.exports.getScheduler = function () {
    var Rx = require('rx/dist/rx.all');
    return new Rx.TestScheduler();
}
