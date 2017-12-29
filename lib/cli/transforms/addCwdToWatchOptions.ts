export function addCwdToWatchOptions(incoming) {
    return incoming.updateIn(['watchOptions', 'cwd'], (watchCwd) => {
        return watchCwd || incoming.get('cwd');
    })
}