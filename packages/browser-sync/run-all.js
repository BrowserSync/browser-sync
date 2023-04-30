const runAll = require("npm-run-all");

runAll(["script:*"], {
    parallel: false,
    stdout: process.stdout,
    stdin: process.stdin,
    stderr: process.stderr
})
    .then(results => {
        console.log(`${results[0].name}: ${results[0].code}`); // clean: 0
        console.log(`${results[1].name}: ${results[1].code}`); // lint: 0
    })
    .catch(err => {
        console.log("failed!");
    });
