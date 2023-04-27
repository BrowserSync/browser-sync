import { merge, printErrors } from "../cli/cli-options";
import { toArray } from "../underbar";

/**
 * @param {import("./browser-sync").default} browserSync
 * @param {String} [name] - instance name
 * @param {Object} pjson
 * @returns {Function}
 */
export default function init(browserSync, name, pjson) {
    return function() {
        /**
         * Handle new + old signatures for init.
         */
        const args = require("../args")(toArray(arguments));

        /**
         * If the current instance is already running, just return an error
         */
        if (browserSync.active) {
            return args.cb(new Error(`Instance: ${name} is already running!`));
        }

        // Env specific items
        args.config.version = pjson.version;
        args.config.cwd = args.config.cwd || process.cwd();

        const [opts, errors] = merge(args.config);

        if (errors.length) {
            return args.cb(new Error(printErrors(errors)));
        }

        return browserSync.init(opts, args.cb);
    };
}
