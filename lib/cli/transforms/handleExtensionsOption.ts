import {List} from "immutable";
import {BsTempOptions, explodeFilesArg, TransformResult} from "../cli-options";

const _ = require("../../lodash.custom");

export function handleExtensionsOption(incoming: BsTempOptions): TransformResult {
    const value = incoming.get('extensions');
    if (_.isString(value)) {
        const split = explodeFilesArg(value);
        if (split.length) {
            return [incoming.set('extensions', List(split)), []];
        }
    }
    if (List.isList(value)) {
        return [incoming.set('extensions', value), []];
    }
    return [incoming, []];
}
