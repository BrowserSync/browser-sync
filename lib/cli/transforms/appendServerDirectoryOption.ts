export function appendServerDirectoryOption(incoming) {
    if (!incoming.get('server')) return incoming;
    if (incoming.get('directory')) {
        return incoming.setIn(['server', 'directory'], incoming.has('directory'));
    }
    return incoming;
}
