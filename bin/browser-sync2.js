var startOpts  = require("../lib/cli/opts.start.json");
var reloadOpts = require("../lib/cli/opts.reload.json");
var recipeOpts = require("../lib/cli/opts.recipe.json");
var pkg = require("../package.json");
var utils = require("../lib/utils");

/**
 * Handle cli input
 */
if (!module.parent) {
    var yargs = require("yargs")
        .command('start [options]', 'Start the server')
        .command('init', 'Create a configuration file')
        .command('reload', 'Send a reload event over HTTP protocol')
        .command('recipe <command> [options]', 'Generate the files for a recipe')
        .version(function () {
            return pkg.version;
        })
        .epilogue("For help running a certain command, type <command> --help\neg: browser-sync start --help");

    var argv    = yargs.argv;
    var command = argv._[0];

    var valid = ['start', 'init', 'reload', 'recipe'];
    if (valid.indexOf(command) > -1) {
        var out = handleIncoming(command, yargs.reset());
        // console.log(out);
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


function handleIncoming(command, yargs) {
    if (command === 'start') {
        var out = yargs
            .command('start [options]')
            .options(startOpts)
            .example('browser-sync start -s app', '- Use the App directory to serve files')
            .example('browser-sync start -p www.bbc.co.uk', '- Proxy an existing website')
            .help()
            .argv;
        if (out.help) {
            yargs.showHelp();
        } else {
            handleCli({cli: {flags: out, input: ["start"]}});
        }
    }
    if (command === 'init') {
        var out = yargs
            .command('init', 'Generate a configuration file')
            .example('browser-sync init')
            .help()
            .argv;
        if (out.help) {
            yargs.showHelp();
        } else {
            handleCli({cli: {flags: out, input: ["init"]}});
        }
    }
    if (command === 'reload') {
        var out = yargs
            .command('reload', 'Send a reload event over HTTP protocol')
            .example('browser-sync reload')
            .example('browser-sync reload --port 4000')
            .example('browser-sync reload --port 4000')
            .help()
            .argv;
        if (out.help) {
            yargs.showHelp();
        } else {
            handleCli({cli: {flags: out, input: ["reload"]}});
        }
    }
    if (command === 'recipe') {
        var out = yargs
            .command('recipe <recipe-name> [options]', 'Generate the files for a recipe', function (yargs) {
            	console.log(yargs.argv._[1]);
            })
            .command('recipe ls', 'List all recipes', function (yargs) {
            	console.log(yargs.argv._[1]);
            })
            .example('browser-sync recipe ls', 'list the recipes')
            .example('browser-sync recipe gulp.sass', 'use the gulp.sass recipe')
            .help()
            .argv;
        if (out.help) {
            yargs.showHelp();
        } else {
            console.log('HERE', out);
            // handleCli({cli: {flags: out, input: ["recipe", out["recipe-name"]]}});
        }
    }
}
