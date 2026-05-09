import { List, Map, fromJS } from "immutable";
import { BsTempOptions, TransformResult } from "../cli-options";

export function addToFilesOption(incoming: BsTempOptions): TransformResult {
    if (!incoming.get("watch")) {
        return [incoming, []];
    }

    let serverPaths = [];

    const serveStaticRaw = incoming.get("serveStatic", List([]));
    const fromServeStatic = List.isList(serveStaticRaw)
        ? serveStaticRaw.toArray()
        : Array.isArray(serveStaticRaw)
        ? serveStaticRaw
        : [];
    const ssPaths = fromServeStatic.reduce((acc, ss) => {
        if (typeof ss === "string") {
            return acc.concat(ss);
        }
        if (ss.dir && typeof ss.dir === "string") {
            return acc.concat(ss);
        }
        return acc;
    }, []);

    ssPaths.forEach(p => serverPaths.push(p));

    const server = incoming.get("server");
    if (server) {
        if (server === true) {
            serverPaths.push(".");
        }
        if (typeof server === "string") {
            serverPaths.push(server);
        }
        if (
            List.isList(server) &&
            server.size &&
            server.every(x => typeof x === "string")
        ) {
            server.forEach(s => serverPaths.push(s));
        }
        if (
            Array.isArray(server) &&
            server.length &&
            server.every(x => typeof x === "string")
        ) {
            server.forEach(s => serverPaths.push(s));
        }
        if (
            !List.isList(server) &&
            !Array.isArray(server) &&
            server &&
            typeof server === "object"
        ) {
            const mapVal: Map<string, any> = Map.isMap(server)
                ? (server as Map<string, any>)
                : (fromJS(server) as Map<string, any>);
            const baseDirProp = mapVal.get("baseDir");
            const baseDirs = List([])
                .concat(baseDirProp)
                .filter(Boolean);
            baseDirs.forEach(s => serverPaths.push(s));
        }
    }

    const output = incoming.update("files", files => {
        return List([])
            .concat(files, serverPaths)
            .filter(Boolean);
    });
    return [output, []];
}
