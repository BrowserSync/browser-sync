import { Map, List, fromJS } from "immutable";
import { addToFilesOption } from "./transforms/addToFilesOption";
import { addDefaultIgnorePatterns } from "./transforms/addDefaultIgnorePatterns";
import { copyCLIIgnoreToWatchOptions } from "./transforms/copyCLIIgnoreToWatchOptions";
import { handleExtensionsOption } from "./transforms/handleExtensionsOption";
import { handleFilesOption } from "./transforms/handleFilesOption";
import { handleGhostModeOption } from "./transforms/handleGhostModeOption";
import { handlePortsOption } from "./transforms/handlePortsOption";
import { handleProxyOption } from "./transforms/handleProxyOption";
import { handleServerOption } from "./transforms/handleServerOption";
import { appendServerIndexOption } from "./transforms/appendServerIndexOption";
import { appendServerDirectoryOption } from "./transforms/appendServerDirectoryOption";
import {addCwdToWatchOptions} from "./transforms/addCwdToWatchOptions";

const _ = require("../lodash.custom");
const defaultConfig = require("../default-config");
const immDefs = fromJS(defaultConfig);

/**
 * @param {Object} input
 * @returns {Map}
 */
export function merge(input) {
    const merged = immDefs.mergeDeep(input);
    const transforms = [
        addToFilesOption,
        addCwdToWatchOptions,
        addDefaultIgnorePatterns,
        copyCLIIgnoreToWatchOptions,
        handleServerOption,
        appendServerIndexOption,
        appendServerDirectoryOption,
        handleProxyOption,
        handlePortsOption,
        handleGhostModeOption,
        handleFilesOption,
        handleExtensionsOption
    ];

    const output = transforms.reduce((acc, item) => {
        return item.call(null, acc);
    }, merged);

    // console.log(output.toJSON());

    return output;
}

/**
 * @param string
 */
export function explodeFilesArg(string): string {
    return string.split(",").map(item => item.trim());
}

/**
 * @param value
 * @returns {{globs: Array, objs: Array}}
 */
export function makeFilesArg(value) {
    let globs = [];
    let objs = [];

    if (_.isString(value)) {
        globs = globs.concat(explodeFilesArg(value));
    }

    if (List.isList(value) && value.size) {
        value.forEach(function(value) {
            if (_.isString(value)) {
                globs.push(value);
            } else {
                if (Map.isMap(value)) {
                    objs.push(value);
                }
            }
        });
    }

    return {
        globs: globs,
        objs: objs
    };
}
