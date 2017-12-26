import {List} from "immutable";

export function copyCLIIgnoreToWatchOptions(incoming) {
    if (!incoming.get("ignore")) {
        return incoming;
    }
    return incoming.updateIn(["watchOptions", "ignored"], ignored => {
        const userIgnore = List([]).concat(incoming.get("ignore"));
        return ignored.concat(userIgnore);
    });
}
