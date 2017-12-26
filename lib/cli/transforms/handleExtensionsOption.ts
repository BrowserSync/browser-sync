import {List} from "immutable";
import {explodeFilesArg} from "../cli-options";

const _ = require("../../lodash.custom");

export function handleExtensionsOption(incoming) {
    const value = incoming.get('extensions');
    if (_.isString(value)) {
        const split = explodeFilesArg(value);
        if (split.length) {
            return incoming.set('extensions', List(split));
        }
    }
    if (List.isList(value)) {
        return incoming.set('extensions', value);
    }
    return incoming;
}
