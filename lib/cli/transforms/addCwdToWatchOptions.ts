import {BsTempOptions, TransformResult} from "../cli-options";

export function addCwdToWatchOptions(incoming: BsTempOptions): TransformResult {
    const output = incoming.updateIn(['watchOptions', 'cwd'], (watchCwd) => {
        return watchCwd || incoming.get('cwd');
    });

    return [output, []];
}
