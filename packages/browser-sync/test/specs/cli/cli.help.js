const startOpts = require("../../../cli-options/opts.start")
const initOpts = require("../../../cli-options/opts.init.json")
const recipeOpts = require("../../../cli-options/opts.recipe.json")
const reloadOpts = require("../../../cli-options/opts.reload.json")

function assertHelpOutput(args, cond, done) {
    const stream = require("child_process").spawn("node", [
        require.resolve("../../../dist/bin"),
    ].concat(args));
    const chunks = [];
    stream.stdout.on("data", function (data) {
        chunks.push(data.toString());
        if (cond(chunks.join(""))) {
            stream.kill("SIGINT");
        } else {
            done(new Error(`missing help output for args '${args.join(' ')}'`))
        }
    });
    stream.on("close", function () {
        done();
    });
}

describe("CLI: showing help", function () {
    this.timeout(10000);
    it("--help", function (done) {
        assertHelpOutput(["--help"], text => text.includes(startOpts.serveStatic.desc), done)
    });
    it("start --help", function (done) {
        assertHelpOutput(["start", "--help"], text => text.includes(startOpts.serveStatic.desc), done)
    });
    it("init --help", function (done) {
        assertHelpOutput(["init", "--help"], text => text.includes('Usage: '), done)
    });
    it("reload --help", function (done) {
        assertHelpOutput(["reload", "--help"], text => text.includes(reloadOpts.url.desc), done)
    });
    it("recipe --help", function (done) {
        assertHelpOutput(["recipe", "--help"], text => text.includes(recipeOpts.output.desc), done)
    });
});
