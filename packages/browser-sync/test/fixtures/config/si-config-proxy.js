module.exports = {
    files: "test/fixtures/**/*.css",
    testConfig: true,
    logLevel: "info",
    background: false,
    reloadFileTypes: ['php', 'html', 'js', 'erb'],
    injectFileTypes: ['css', 'png', 'jpg', 'svg', 'gif'],
    host: null,
    ghostMode: {
        links: true,
        forms: true,
        scroll: true
    },
    proxy: {
        host: "192.168.0.4",
        port: "8000"
    },
    open: true
};
