import {List} from "immutable";
import {BsTempOptions, TransformResult} from "../cli-options";

const defaultIgnorePatterns = [
    /node_modules/,
    /bower_components/,
    '.sass-cache',
    '.vscode',
    '.git',
    '.idea',
];

export function addDefaultIgnorePatterns(incoming: BsTempOptions): TransformResult {
    if (!incoming.get("watch")) {
        return [incoming, []];
    }

    const output = incoming.update("watchOptions", watchOptions => {
        const userIgnored = List([])
            .concat(watchOptions.get("ignored"))
            .filter(Boolean)
            .toSet();

        const merged = userIgnored.merge(defaultIgnorePatterns);

        return watchOptions.merge({
            ignored: merged.toList(),
        });
    });

    return [output, []];
}
