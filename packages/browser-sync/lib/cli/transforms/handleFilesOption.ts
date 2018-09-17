import {fromJS} from "immutable";
import {BsTempOptions, makeFilesArg, TransformResult} from "../cli-options";
import {FilesNamespaces} from "../../types";

export function handleFilesOption(incoming: BsTempOptions): TransformResult {
    const value = incoming.get('files');
    const namespaces: FilesNamespaces = {
        core: {
            globs: [],
            objs: []
        }
    };

    const processed = makeFilesArg(value);

    if (processed.globs.length) {
        namespaces.core.globs = processed.globs;
    }

    if (processed.objs.length) {
        namespaces.core.objs = processed.objs;
    }

    return [incoming.set('files', fromJS(namespaces)), []];
}
