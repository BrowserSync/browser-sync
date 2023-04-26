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
import { addCwdToWatchOptions } from "./transforms/addCwdToWatchOptions";
import {
    setMode,
    setScheme,
    setStartPath,
    setProxyWs,
    setServerOpts,
    liftExtensionsOptionFromCli,
    setNamespace,
    fixSnippetIgnorePaths,
    fixSnippetIncludePaths,
    fixRewriteRules,
    setMiddleware,
    setOpen,
    setUiPort
} from "../options";
import { BsErrors } from "../bin";
import { handleHostOption } from "./transforms/handleHostOption";

const _ = require("../lodash.custom");
const defaultConfig = require("../default-config");
const immDefs = fromJS(defaultConfig);

/**
 * @param {Object} input
 * @returns {Map}
 */
export type BsTempOptions = Map<string, any>;
export type TransformResult = [BsTempOptions, BsErrors];
export type TransformFn = (subject: BsTempOptions) => TransformResult;

export function merge(input) {
    const merged = immDefs.mergeDeep(input);
    const transforms: TransformFn[] = [
        addToFilesOption,
        addCwdToWatchOptions,
        addDefaultIgnorePatterns,
        copyCLIIgnoreToWatchOptions,
        handleServerOption,
        appendServerIndexOption,
        appendServerDirectoryOption,
        handleProxyOption,
        handlePortsOption,
        handleHostOption,
        handleGhostModeOption,
        handleFilesOption,
        handleExtensionsOption,
        setMode,
        setScheme,
        setStartPath,
        setProxyWs,
        setServerOpts,
        liftExtensionsOptionFromCli,
        setNamespace,
        fixSnippetIgnorePaths,
        fixSnippetIncludePaths,
        fixRewriteRules,
        setMiddleware,
        setOpen,
        setUiPort
    ];

    const output = transforms.reduce(
        (acc: TransformResult, item: TransformFn) => {
            const [current, currentErrors] = acc;
            const [result, errors] = item.call(null, current);
            return [result, [...currentErrors, ...errors]];
        },
        [merged, []] as TransformResult
    );

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

export function printErrors(errors: BsErrors) {
    return errors
        .map(error =>
            [
                `Error Type:    ${error.type}`,
                `Error Level:   ${error.level}`,
                error.errors.map(item =>
                    [
                        `Error Message: ${item.error.message}`,
                        item.meta ? item.meta().join("\n") : ""
                    ]
                        .filter(Boolean)
                        .join("\n")
                )
            ].join("\n")
        )
        .join("\n\n");
}
