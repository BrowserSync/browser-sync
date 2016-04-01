// var bs = require("./").create();
//
// /**
//  * Start the Browsersync server and
//  * load the express app as middleware
//  */
// bs.init({
//     https: true,
//     scriptPath: function (path, port, options) {
//         return options.get('absolute').replace('HOST', 'localhost');
//     }
// });

var input = [
    '--server.baseDir', '.',
    '--server.index', 'index.htm',
    '--server.extensions', '.html', '.css',
    '--proxy.ws', 'true',
    '--index',
    '--serveStatic', '.', 'another',
    '--ss', '.tmp', 'app',
    '--open',
    '--browser', 'chrome', 'firefox',
    '--files', '*.css', '*.html',
    '--plugins', 'bs-html-injector?files[]=*.html&files[]=*.css'
];

var qs         = require('qs');
var startOpts  = require('../lib/cli/opts.start.json');
var reloadOpts = require('../lib/cli/opts.reload.json');
var recipeOpts = require('../lib/cli/opts.recipe.json');

var commands = {
    "start": {
        command: 'start [options]',
        description: 'Start Browsersync',
        builder: startOpts,
        handler: function (argv) {
            console.log('From start', argv);
        }
    },
    "reload": {
        command: 'reload [options]',
        description: 'Send a reload event over HTTP protocol',
        builder: reloadOpts,
        handler: function (argv) {
            console.log('From reload', argv);
        }
    },
    "init": {
        command: 'init',
        description: 'Creates a default config file',
        builder: {},
        handler: function (argv) {
            console.log('From init', argv);
        }
    },
    "recipe-ls": {
        command: 'recipe ls [options]',
        description: 'list all recipes',
        builder: {},
        handler: function (argv) {
            console.log('From recipe ls', argv);
        }
    },
    "recipe": {
        command: 'recipe <recipe-name> [options]',
        description: 'Generate the files for a recipe',
        builder: recipeOpts,
        handler: function (argv) {
            console.log('From recipe', argv);
        }
    }
};

var yargs = attachCommands(require('yargs'), commands)
    .demand(1)
    .epilogue(`For help running a certain command, type <command> --help
eg: browser-sync start --help`);


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


// console.log(
//     yargs
//     .options(startOpts)
//     .argv);

// var out = yargs
//     .command('start [options]', 'Start the Browsersync server', {
//         builder: startOpts,
//         handler: function (argv) {
//             console.log('From start');
//             // console.log(argv.version);
//         }
//     })
//     .version(function() {
//         return require('./package.json').version;
//     })
//     .help()
//     .argv;

// var out2 = yargs
//     .command('reload [options]', 'Send a reload command over http', {
//         builder: reloadOpts,
//         handler: function (argv) {
//
//             console.log('From reload', argv);
//             // console.log(argv.version);
//         }
//     })
//     .version(function() {
//         return require('./package.json').version;
//     })
//     .help()
//     .argv;


// console.log(out);

// var out = Object.keys(ops).reduce(function (acc, key) {
//     acc[key] = {
//         desc: ops[key]
//     }
//     return acc;
// }, {});
// console.log(JSON.stringify(out, null, 4));
// var opts = {
//     "browser": {
//         alias: "b",
//         type: "array",
//         desc: "Choose which browser should be auto-opened"
//     },
//     "files": {
//         alias: "f",
//         type: "array",
//         desc: "File paths to watch"
//     },
//     "server": {
//         desc: "Run a Local server from a directory",
//     },
//     "serveStatic": {
//         type: "array",
//         desc: "Directories to serve static files from"
//     },
//     "index": {
//         type: "string",
//         desc: "Specify which file should be used as the index page"
//     },
//     "extensions": {
//         desc: "Specify file extension fallbacks"
//     }
// }
//
// var out = yargs
//     .option('server')
//     .options(opts);
// // .array('files')
// // // server
// // .alias('ss', 'serveStatic')
// // .string('index')
// // .array('serveStatic')
// // .array('server.extensions')
// // .boolean('open')
// // .alias('ws', 'proxy.ws')
// // .alias('s', 'server')
// // .array('plugins');
//
// console.log(out.argv);

// console.log(qs.parse(out.argv.plugins[0].split('?')[1]));
