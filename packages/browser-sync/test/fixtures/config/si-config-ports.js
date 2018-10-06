module.exports = {
    files: "test/fixtures/**/*.css",
    testConfig: true,
    logLevel: "info",
    background: false,
    reloadFileTypes: ['php', 'html', 'js', 'erb'],
    injectFileTypes: ['css', 'png', 'jpg', 'svg', 'gif'],
    host: null,
    ports: {
        min: 4000,
        max: 4004
    },
    ghostMode: {
        links: true,
        forms: true,
        scroll: true
    },
    server: {
        baseDir: "test/fixtures"
    },
    open: true
};