import * as path from "path";
import { existsSync } from "fs";
import { fromJS } from "immutable";
import * as utils from "../utils";
import { explodeFilesArg } from "./cli-options";
const _ = require("../lodash.custom");

/**
 * $ browser-sync start <options>
 *
 * This commands starts the Browsersync servers
 * & Optionally UI.
 *
 * @param opts
 * @returns {Function}
 */
export default function(opts) {
    const flags = preprocessFlags(opts.cli.flags);
    const cwd = flags.cwd || process.cwd();
    const maybepkg = path.resolve(cwd, "package.json");
    let input = flags;

    if (flags.config) {
        const maybeconf = path.resolve(cwd, flags.config);
        if (existsSync(maybeconf)) {
            const conf = require(maybeconf);
            input = _.merge({}, conf, flags);
        } else {
            utils.fail(
                true,
                new Error(`Configuration file '${flags.config}' not found`),
                opts.cb
            );
        }
    } else {
        if (existsSync(maybepkg)) {
            const pkg = require(maybepkg);
            if (pkg["browser-sync"]) {
                console.log("> Configuration obtained from package.json");
                input = _.merge({}, pkg["browser-sync"], flags);
            }
        }
    }

    return require("../")
        .create("cli")
        .init(input, opts.cb);
}

/**
 * @param flags
 * @returns {*}
 */
function preprocessFlags(flags) {
    return [
        stripUndefined,
        legacyFilesArgs,
        removeWatchBooleanWhenFalse
    ].reduce((flags, fn) => fn.call(null, flags), flags);
}

/**
 * Incoming undefined values are problematic as
 * they interfere with Immutable.Map.mergeDeep
 * @param subject
 * @returns {*}
 */
function stripUndefined(subject) {
    return Object.keys(subject).reduce((acc, key) => {
        const value = subject[key];
        if (typeof value === "undefined") {
            return acc;
        }
        acc[key] = value;
        return acc;
    }, {});
}

/**
 * @param flags
 * @returns {*}
 */
function legacyFilesArgs(flags) {
    if (flags.files && flags.files.length) {
        flags.files = flags.files.reduce(
            (acc, item) => acc.concat(explodeFilesArg(item)),
            []
        );
    }
    return flags;
}

/**
 * `watch` is a CLI boolean so should be removed if false to
 * allow config to set watch: true
 * @param flags
 * @returns {any}
 */
function removeWatchBooleanWhenFalse(flags) {
    if (flags.watch === false) {
        return fromJS(flags)
            .delete("watch")
            .toJS();
    }
    return flags;
}
