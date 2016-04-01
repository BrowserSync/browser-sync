var startOpts  = require('../lib/cli/opts.start.json');
var reloadOpts = require('../lib/cli/opts.reload.json');
var recipeOpts = require('../lib/cli/opts.recipe.json');
var pkg        = require('../package.json');

var commands = {
    "start": {
        command: 'start [options]',
        description: 'Start Browsersync',
        builder: startOpts,
        handler: function (argv) {
            console.log('From start');
            console.log(argv);
        }
    },
    "reload": {
        command: 'reload [options]',
        description: 'Send a reload event over HTTP protocol',
        builder: reloadOpts,
        handler: function (argv) {
            console.log('From reload');
            console.log(argv);
        }
    },
    "init": {
        command: 'init',
        description: 'Creates a default config file',
        builder: {},
        handler: function (argv) {
            console.log('From init');
            console.log(argv);
        }
    },
    "recipe": {
        command: 'recipe <recipe-name> [options]',
        description: 'Generate the files for a recipe',
        builder: recipeOpts,
        handler: function (argv) {
            console.log('From recipe');
            console.log(argv);
        }
    }
};

var yargs = attachCommands(require('yargs'), commands)
    .demand(1)
    .version(function () {
    	return pkg.version;
    })
    .epilogue('For help running a certain command, type <command> --help\neg: browser-sync start --help');

var argv = yargs.argv;
var command = argv._[0];

if (Object.keys(commands).indexOf(command) > -1) {
    handleIncoming(commands[command]);
} else {
    yargs.showHelp();
}

function attachCommands (yargs, commands) {
    Object.keys(commands).forEach(function (key) {
        yargs.command(key, commands[key].description);
    });
    return yargs;
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