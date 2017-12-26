export function appendServerIndexOption(incoming) {
    if (!incoming.get('server')) return incoming;
    const value = incoming.get('index');

    if (value) {
        return incoming.setIn(['server', 'index'], value);
    }

    return incoming;
}
