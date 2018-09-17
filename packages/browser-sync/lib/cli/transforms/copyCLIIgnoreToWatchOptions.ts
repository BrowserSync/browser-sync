import {List} from "immutable";
import {BsTempOptions, TransformResult} from "../cli-options";

export function copyCLIIgnoreToWatchOptions(incoming: BsTempOptions): TransformResult {
    if (!incoming.get("ignore")) {
        return [incoming, []];
    }
    const output = incoming.updateIn(["watchOptions", "ignored"], List([]), ignored => {
        return List([]).concat(ignored, incoming.get("ignore"));
    });

    return [output, []];
}
