import {List} from "immutable";

const defaultIgnorePatterns = [
    /node_modules/,
    /bower_components/,
    /\.sass-cache/,
    /\.vscode/,
    /\.git/,
    /\.idea/
];

export function addDefaultIgnorePatterns(incoming) {
    return incoming.update("watchOptions", watchOptions => {
        const userIgnored = List([])
            .concat(watchOptions.get("ignored"))
            .filter(Boolean)
            .toSet();

        const merged = userIgnored.merge(defaultIgnorePatterns);

        return watchOptions.merge({
            ignored: merged.toList(),
        });
    });
}
