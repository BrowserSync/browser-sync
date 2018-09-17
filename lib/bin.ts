#!/usr/bin/env node
const startOpts = require("../cli-options/opts.start.json");
const reloadOpts = require("../cli-options/opts.reload.json");
const recipeOpts = require("../cli-options/opts.recipe.json");
const pkg = require("../package.json");
import * as utils from "./utils";
import { resolve } from "path";
import { existsSync } from "fs";
import { logger } from "./logger";
import { compile } from "eazy-logger";
import {printErrors} from "./cli/cli-options";

export enum BsErrorLevels {
    Fatal = "Fatal"
}

export enum BsErrorTypes {
    PathNotFound = "PathNotFound",
    HostAndListenIncompatible = "HostAndListenIncompatible",
}

export type BsErrors = BsError[];
export interface BsError {
    type: BsErrorTypes,
    level: BsErrorLevels,
    errors: BsErrorItem[]
}
export interface BsErrorItem {
    error: Error,
    meta?(...args): string[]
}

/**
 * Handle cli input
 */
if (!module.parent) {
    runFromCli();
}

function runFromCli() {
    const yargs = require("yargs")
        .command("start", "Start the server")
        .command("init", "Create a configuration file")
        .command("reload", "Send a reload event over HTTP protocol")
        .command("recipe", "Generate the files for a recipe")
        .version(() => pkg.version)
        .epilogue(
            [
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
            ].join("\n")
        );

    const argv = yargs.argv;
    const input = argv._;
    const command = input[0];
    const valid = ["start", "init", "reload", "recipe"];

    if (valid.indexOf(command) > -1) {
        return handleIncoming(command, yargs.reset());
    }

    if (input.length) {
        return handleNoCommand(argv, input, yargs);
    }

    if (existsSync("index.html")) {
        return handleNoCommand(argv, ["."], yargs);
    }

    yargs.showHelp();
}

/**
 * Feature: If no command was specified, try to do the 'right thing'
 *
 * If paths were given, start the server
 *          eg: browser-sync app/code app/design
 * is equal to: browser-sync start --server app/code app/design
 *
 *           eg: browser-sync http://example.com
 * is equal to: browser-sync start --proxy http://example.com
 *
 *           eg: browser-sync http://example.com themes/example
 * is equal to: browser-sync start --proxy http://example.com --ss themes/example
 *
 * @param argv
 * @param input
 * @returns {any}
 */
function handleNoCommand(argv, input, yargs) {
    const processed = processStart(yargs);
    const paths = input.map(path => {
        const resolved = resolve(path);
        const isUrl = /^https?:\/\//.test(path);
        return {
            isUrl,
            userInput: path,
            resolved,
            errors: isUrl ? [] : pathErrors(path, resolved)
        };
    });

    const withErrors = paths.filter(item => item.errors.length);
    const withoutErrors = paths.filter(item => item.errors.length === 0);

    if (withErrors.length) {
        withErrors.forEach(item => {
            logger.unprefixed("error", printErrors(item.errors));
        });
        return process.exit(1);
    }

    const serveStaticPaths = withoutErrors
        .filter(item => item.isUrl === false)
        .map(item => item.resolved);

    const urls = withoutErrors
        .filter(item => item.isUrl === true)
        .map(item => item.userInput);

    /**
     * If a URL was given, switch to proxy mode and use
     * any other paths as serveStatic options
     */
    if (urls.length) {
        const proxy = urls[0];
        const config = {
            ...processed,
            proxy,
            serveStatic: serveStaticPaths
        };
        return handleCli({ cli: { flags: config, input: ["start"] } });
    }

    /**
     * if NO urls were given switch directly to server mode
     * @type {{server: {baseDir: any}}}
     */
    const config = {
        ...processed,
        server: { baseDir: serveStaticPaths }
    };

    return handleCli({ cli: { flags: config, input: ["start"] } });
}

/**
 * @param {{cli: object, [whitelist]: array, [cb]: function}} opts
 * @returns {*}
 */
function handleCli(opts) {
    opts.cb = opts.cb || utils.defaultCallback;
    const m = require(`./cli/command.${opts.cli.input[0]}`);
    if (m.default) {
        return m.default(opts);
    }
    return m(opts);
}

export default handleCli;

function processStart(yargs) {
    return yargs
        .usage("Usage: $0 start [options]")
        .options(startOpts)
        .example("$0 start -s app", "- Use the App directory to serve files")
        .example("$0 start -p www.bbc.co.uk", "- Proxy an existing website")
        .default('cwd', () => process.cwd())
        .help().argv;
}

/**
 * @param {string} command
 * @param {object} yargs
 * @param cwd
 */
function handleIncoming(command, yargs) {
    let out;
    if (command === "start") {
        out = processStart(yargs);
    }
    if (command === "init") {
        out = yargs
            .usage("Usage: $0 init")
            .example("$0 init")
            .default('cwd', () => process.cwd())
            .help().argv;
    }
    if (command === "reload") {
        out = yargs
            .usage("Usage: $0 reload")
            .options(reloadOpts)
            .example("$0 reload")
            .example("$0 reload --port 4000")
            .default('cwd', () => process.cwd())
            .help().argv;
    }
    if (command === "recipe") {
        out = yargs
            .usage("Usage: $0 recipe <recipe-name>")
            .option(recipeOpts)
            .example("$0 recipe ls", "list the recipes")
            .example("$0 recipe gulp.sass", "use the gulp.sass recipe")
            .default('cwd', () => process.cwd())
            .help().argv;
    }

    if (out.help) {
        return yargs.showHelp();
    }

    handleCli({ cli: { flags: out, input: out._ } });
}

function pathErrors(input, resolved): BsErrors {
    if (!existsSync(resolved)) {
        return [
            {
                type: BsErrorTypes.PathNotFound,
                level: BsErrorLevels.Fatal,
                errors: [
                    {
                        error: new Error(`Path not found: ${input}`),
                        meta() {
                            return [
                                `Your Input:    {yellow:${input}}`,
                                `CWD:           {yellow:${process.cwd()}}`,
                                `Resolved to:   {yellow:${resolved}}`
                            ];
                        }
                    }
                ]
            }
        ];
    }
    return [];
}
