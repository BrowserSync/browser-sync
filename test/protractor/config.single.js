exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: [
        'tests/server.interactions.js',
        'tests/proxy.interactions.js',
        'tests/actions.scroll.js',
        'tests/actions.clicks.js'
    ]
};