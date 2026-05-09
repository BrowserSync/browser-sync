import { IServerOption } from "../../types";
import { fromJS, List, Map } from "immutable";
import { BsTempOptions, TransformResult } from "../cli-options";

export function handleServerOption(incoming: BsTempOptions): TransformResult {
    const value = incoming.get("server");
    if (value === false) {
        return [incoming, []];
    }

    // server: true
    if (value === true) {
        const obj: IServerOption = {
            baseDir: ["./"]
        };
        return [incoming.set("server", fromJS(obj)), []];
    }

    // server: "./app"
    if (typeof value === "string") {
        const obj: IServerOption = {
            baseDir: [value]
        };
        return [incoming.set("server", fromJS(obj)), []];
    }

    if (List.isList(value) || Array.isArray(value)) {
        const baseDir = List.isList(value)
            ? (value as List<string>).toArray()
            : (value as string[]);
        const obj: IServerOption = {
            baseDir
        };
        return [incoming.set("server", fromJS(obj)), []];
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
        const mapVal: Map<string, any> = Map.isMap(value)
            ? (value as Map<string, any>)
            : (fromJS(value) as Map<string, any>);
        const dirs = List([])
            .concat(mapVal.get("baseDir", "./"))
            .filter(Boolean);

        const merged = mapVal.merge({ baseDir: dirs });

        return [incoming.set("server", merged), []];
    }

    return [incoming, []];
}
