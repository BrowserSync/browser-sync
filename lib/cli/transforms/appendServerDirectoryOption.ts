import {BsTempOptions, TransformResult} from "../cli-options";

export function appendServerDirectoryOption(incoming: BsTempOptions): TransformResult {
    if (!incoming.get('server')) return [incoming, []];
    if (incoming.get('directory')) {
        return [incoming.setIn(['server', 'directory'], incoming.has('directory')), []];
    }
    return [incoming, []];
}
