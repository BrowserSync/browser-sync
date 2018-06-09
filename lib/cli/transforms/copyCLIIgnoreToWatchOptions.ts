import {List} from "immutable";

export function copyCLIIgnoreToWatchOptions(incoming) {
    if (!incoming.get("ignore")) {
        return incoming;
    }
    return incoming.updateIn(["watchOptions", "ignored"], List([]), ignored => {
        return List([]).concat(ignored, incoming.get("ignore"));
    });
}
