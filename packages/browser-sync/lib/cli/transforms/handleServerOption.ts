import {IServerOption} from "../../types";
import {fromJS, List, Map} from "immutable";
import {BsTempOptions, TransformResult} from "../cli-options";

export function handleServerOption(incoming: BsTempOptions): TransformResult {
    const value = incoming.get('server');
    if (value === false) {
        return [incoming, []];
    }

    // server: true
    if (value === true) {
        const obj: IServerOption = {
            baseDir: ["./"]
        };
        return [incoming.set('server', fromJS(obj)), []];
    }

    // server: "./app"
    if (typeof value === "string") {
        const obj: IServerOption = {
            baseDir: [value]
        };
        return [incoming.set('server', fromJS(obj)), []];
    }

    if (List.isList(value)) {
        const obj: IServerOption = {
            baseDir: value
        };
        return [incoming.set('server', fromJS(obj)), []];
    }

    if (Map.isMap(value)) {
        const dirs = List([])
            .concat(value.get("baseDir", "./"))
            .filter(Boolean);

        const merged = value.merge({baseDir: dirs});

        return [incoming.set('server', merged), []];
    }

    return [incoming, []];
}
