#!/usr/bin/env node
var startOpts = require("../lib/cli/opts.start.json");
var reloadOpts = require("../lib/cli/opts.reload.json");
var recipeOpts = require("../lib/cli/opts.recipe.json");
var pkg = require("../package.json");
var utils = require("../lib/utils");
var resolve = require("path").resolve;
var existsSync = require("fs").existsSync;
var logger = require("../lib/logger").logger;
var compile = require("eazy-logger").compile;

var BsErrorLevels = {
    Fatal: "Fatal"
};

var BsErrorTypes = {
    PathNotFound: "PathNotFound"
};

/**
 * Handle cli input
 */
if (!module.parent) {
    var yargs = require("yargs")
        .command("start", "Start the server")
        .command("init", "Create a configuration file")
        .command("reload", "Send a reload event over HTTP protocol")
        .command("recipe", "Generate the files for a recipe")
        .version(function () {
            return pkg.version;
        })
        .epilogue([
            "For help running a certain command, type <command> --help",
            "  $0 start --help",
            "",
            "You can run a static server by providing a path(s) directly",
            "  $0 app/src app/tmp",
            "",
            "If the directory contains a 'index.html' file, you can omit any input",
            "  $0",
            "",
            "You can run the proxy in this manner too",
            "  $0 https://example.com",
            "",
            "To run a proxy, whilst also serving static files",
            compile("  $0 https://example.com htdocs/themes/example")
        ].join("\n"));

    var argv = yargs.argv;
    var input = argv._;
    var command = input[0];
    var valid = ["start", "init", "reload", "recipe"];

    if (argv.help) {
        return yargs.showHelp();
    }
    
    if (valid.indexOf(command) > -1) {
        return handleIncoming(command, yargs.reset());
    }

    if (input.length) {
        return handleNoCommand(argv, input);
    }

    if (existsSync("index.html")) {
        return handleNoCommand(argv, ["."]);
    }

    yargs.showHelp();
}

function handleNoCommand(argv, input) {
    var paths = input.map(function (path) {
        var resolved = resolve(path);
        var isUrl = /^https?:\/\//.test(path);
        return {
            isUrl: isUrl,
            userInput: path,
            resolved: resolved,
            errors: isUrl ? [] : pathErrors(path, resolved)
        }
    });

    var withErrors = paths.filter(function (item) {
        return item.errors.length
    });

    var withoutErrors = paths.filter(function (item) {
        return item.errors.length === 0
    });

    if (withErrors.length) {
        withErrors.forEach(function (item) {
            logger.unprefixed("error", printErrors(item.errors));
        });
        process.exit(1);
    } else {
        var ssPaths = withoutErrors
            .filter(function (item) {
                return item.isUrl === false
            })
            .map(function (item) {
                return item.resolved
            });

        var urls = withoutErrors
            .filter(function (item) {
                return item.isUrl === true
            })
            .map(function (item) {
                return item.userInput
            });

        if (urls.length) {
            var proxy = urls[0];
            var config = Object.assign({}, argv, {
                proxy: proxy,
                serveStatic: ssPaths
            });
            handleCli({ cli: { flags: config, input: ["start"] } });
        } else {
            var config = Object.assign({}, argv, {
                server: { baseDir: ssPaths }
            });
            handleCli({ cli: { flags: config, input: ["start"] } });
        }
    }
}

/**
 * @param {{cli: object, [whitelist]: array, [cb]: function}} opts
 * @returns {*}
 */
function handleCli (opts) {

    opts.cb = opts.cb || utils.defaultCallback;
    return require("../lib/cli/command." + opts.cli.input[0])(opts);
}

module.exports = handleCli;

/**
 * @param {string} command
 * @param {object} yargs
 */
function handleIncoming (command, yargs) {
    var out;
    if (command === "start") {
        out = yargs
            .usage("Usage: $0 start [options]")
            .options(startOpts)
            .example("$0 start -s app", "- Use the App directory to serve files")
            .example("$0 start -p www.bbc.co.uk", "- Proxy an existing website")
            .help()
            .argv;
    }
    if (command === "init") {
        out = yargs
            .usage("Usage: $0 init")
            .example("$0 init")
            .help()
            .argv;
    }
    if (command === "reload") {
        out = yargs
            .usage("Usage: $0 reload")
            .options(reloadOpts)
            .example("$0 reload")
            .example("$0 reload --port 4000")
            .help()
            .argv;
    }
    if (command === "recipe") {
        out = yargs
            .usage("Usage: $0 recipe <recipe-name>")
            .option(recipeOpts)
            .example("$0 recipe ls", "list the recipes")
            .example("$0 recipe gulp.sass", "use the gulp.sass recipe")
            .help()
            .argv;
    }

    if (out.help) {
        return yargs.showHelp();
    }

    handleCli({ cli: { flags: out, input: out._ } });
}

function pathErrors (input, resolved) {
    if (!existsSync(resolved)) {
        return [
            {
                type: BsErrorTypes.PathNotFound,
                level: BsErrorLevels.Fatal,
                errors: [{
                    error: new Error("Path not found: " + input),
                    meta: function () {
                        return [
                            "Your Input:    {yellow:" + input + "}",
                            "CWD:           {yellow:" + process.cwd() + "}",
                            "Resolved to:   {yellow:" + resolved + "}"
                        ];
                    }
                }]
            }
        ]
    }
    return []
}

function printErrors (errors) {
    return errors.map(function (error) {
        return [
            "Error Type:    {bold:" + error.type + "}",
            "Error Level:   {bold:" + error.level + "}",
            error.errors.map(function (item) {
                return [
                    "Error Message: " + item.error.message,
                    item.meta ? item.meta().join("\n") : ""
                ].filter(Boolean).join("\n")
            }),
        ].join("\n");
    }).join("\n\n");
}
