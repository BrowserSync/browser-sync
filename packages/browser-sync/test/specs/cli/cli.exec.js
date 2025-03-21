describe.only("CLI: exec", function() {
    this.timeout(10000);
    it("Can launch from cli", function(done) {
        var strem = require("child_process").spawn("node", [
            require.resolve("../../../dist/bin"),
            "start"
        ]);
        let timer;
        let chunks = [];
        strem.stdout.on("data", function(data) {
            chunks.push(data.toString());
            if (chunks.join("").indexOf("Copy the following snippet") > -1) {
                strem.kill("SIGINT");
                clearTimeout(timer);
            }
        });
        strem.on("close", function() {
            done();
        });

        timer = setTimeout(() => {
            done(new Error("missing output"));
        }, 1000);
    });
});
