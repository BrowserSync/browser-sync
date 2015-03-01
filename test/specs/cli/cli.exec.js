"use strict";

describe("CLI: exec", function () {
    this.timeout(10000);
    it("Can launch from cli", function (done) {
        var strem = require("child_process").spawn("node", [require.resolve("../../../bin/browser-sync"), "start"]);
        var chunks = [];
        strem.stdout.on("data", function (data) {
            chunks.push(data.toString());
            if (chunks.join("").indexOf("Copy the following snippet")) {
                strem.kill("SIGINT");
            }
        });
        strem.on("close", function () {
            done();
        });
    });
});
