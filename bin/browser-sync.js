var startOpts  = require("../lib/cli/opts.start.json");
var reloadOpts = require("../lib/cli/opts.reload.json");
var recipeOpts = require("../lib/cli/opts.recipe.json");
var pkg = require("../package.json");
var utils = require("../lib/utils");

var commands = {
    "start": {
        command: "start [options]",
        description: "Start Browsersync",
        builder: startOpts,
        handler: function (argv) {
            handleCli({cli: {flags: argv, input: ["start"]}});
        }
    },
    "reload": {
        command: "reload [options]",
        description: "Send a reload event over HTTP protocol",
        builder: reloadOpts,
        handler: function (argv) {
            handleCli({cli: {flags: argv, input: ["reload"]}});
        }
    },
    "init": {
        command: "init",
        description: "Creates a default config file",
        builder: {},
        handler: function (argv) {
            handleCli({cli: {flags: argv, input: ["init"]}});
        }
    },
    "recipe": {
        command: "recipe <recipe-name> [options]",
        description: "Generate the files for a recipe",
        builder: recipeOpts,
        handler: function (argv) {
            handleCli({cli: {flags: argv, input: ["recipe", argv["recipe-name"]]}});
        }
    }
};

/**
 * Handle cli input
 */
if (!module.parent) {
    var yargs = attachCommands(require("yargs"), commands)
        .demand(1)
        .version(function () {
            return pkg.version;
        })
        .epilogue("For help running a certain command, type <command> --help\neg: browser-sync start --help");
    var argv = yargs.argv;
    var command = argv._[0];

    if (Object.keys(commands).indexOf(command) > -1) {
        handleIncoming(commands[command]);
    } else {
        yargs.showHelp();
    }
}

/**
 * @param {{cli: object, [whitelist]: array, [cb]: function}} opts
 * @returns {*}
 */
function handleCli(opts) {

    opts.cb = opts.cb || utils.defaultCallback;
    return require("../lib/cli/command." + opts.cli.input[0])(opts);
}

module.exports = handleCli;

function attachCommands(yargs, commands) {
    Object.keys(commands).forEach(function (key) {
        yargs.command(key, commands[key].description);
    });
    return yargs
}

function handleIncoming(obj) {
    return yargs
        .command(obj.command, obj.description, {
            builder: obj.builder,
            handler: obj.handler
        })
        .help()
        .argv;
}
