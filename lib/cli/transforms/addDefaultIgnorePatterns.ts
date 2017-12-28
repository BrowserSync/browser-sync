import {List} from "immutable";

const defaultIgorePatterns = [
    /node_modules/,
    /bower_components/,
    /\.sass-cache/,
    /\.vscode/,
    /\.git/,
    /\.idea/
];

export function addDefaultIgnorePatterns(incoming) {
    if (!incoming.get("watch")) {
        return incoming;
    }

    return incoming.update("watchOptions", watchOptions => {
        const userIgnored = List([])
            .concat(watchOptions.get("ignored"))
            .filter(Boolean)
            .toSet();

        const merged = userIgnored.merge(defaultIgorePatterns);

        return watchOptions.merge({
            ignored: merged.toList(),
            cwd: incoming.get("cwd")
        });
    });
}
