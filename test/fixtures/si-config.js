module.exports = {
    files: "test/fixtures/**/*.css",
    testConfig: true,
    debugInfo: true,
    background: false,
    reloadFileTypes: ['php', 'html', 'js', 'erb'],
    injectFileTypes: ['css', 'png', 'jpg', 'svg', 'gif'],
    host: null,
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
