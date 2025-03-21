var chalk       = require("chalk");
module.exports = require("eazy-consola").Logger({
    prefix: chalk.magenta("[BS E2E] "),
    useLevelPrefixes: true,
    custom: {
        "i": function (string) {
            return chalk.cyan(string)
        }
    }
});
