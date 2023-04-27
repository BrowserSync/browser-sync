// @ts-check
import config from "../config";
import { logger } from "../logger";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import { includes } from "../underbar";

const info = {
    /**
     * Version info
     * @param {Object} pjson
     * @returns {String}
     */
    getVersion: function(pjson) {
        console.log(pjson.version);
        return pjson.version;
    },
    /**
     * Retrieve the config file
     * @returns {*}
     * @private
     * @param filePath
     */
    getConfigFile: function(filePath) {
        return require(path.resolve(filePath));
    },
    /**
     * Generate an example Config file.
     */
    makeConfig: function(cwd, cb) {
        var opts = require(path.join(__dirname, "..", config.configFile));
        var userOpts = {};

        var ignore = ["excludedFileTypes", "injectFileTypes", "snippetOptions"];

        Object.keys(opts).forEach(function(key) {
            if (!includes(ignore, key)) {
                userOpts[key] = opts[key];
            }
        });

        var file = fs.readFileSync(config.template, "utf8");
        file = file.replace("//OPTS", JSON.stringify(userOpts, null, 4));

        fs.writeFile(path.resolve(cwd, config.userFile), file, function() {
            logger.info("Config file created %s", chalk.magenta(config.userFile));
            logger.info(
                "To use it, in the same directory run: " +
                    chalk.cyan("browser-sync start --config bs-config.js")
            );
            cb();
        });
    }
};

export default info;
