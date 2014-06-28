"use strict";

module.exports = function (browserSync) {

    function exit() {
        if (browserSync.active) {
            browserSync.cleanup();
        }
        process.exit();
    }

    process.on("message", function(m) {
        browserSync.events.on("init", function () {
            process.send({options: browserSync.options});
        });
    });

    process.on("SIGINT", exit);

    return exit;
};