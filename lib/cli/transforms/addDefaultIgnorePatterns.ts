import {List} from "immutable";

export function addDefaultIgnorePatterns(incoming) {
    if (!incoming.get("watch")) {
        return incoming;
    }

    return incoming.update("watchOptions", watchOptions => {
        const userIgnored = List([])
            .concat(watchOptions.get("ignored"))
            .filter(Boolean)
            .toSet();

        const merged = userIgnored.merge([
            /node_modules/,
            /bower_components/,
            /\.sass-cache/,
            /\.vscode/,
            /\.git/,
            /\.idea/,
            "!node_modules/**/*",
            "!**/node_modules/**"
        ]);

        return watchOptions.merge({
            ignored: merged.toList(),
            cwd: incoming.get("cwd")
        });
    });
}
