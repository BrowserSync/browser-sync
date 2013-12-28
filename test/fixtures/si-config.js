module.exports = {
    files: ["test/fixtures/**/*.css", "test/fixtures/**/*.html"],
    testConfig: true,
    debugInfo: false,
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
    open: true,
    timestamps: false,
    fileTimeout: 1000
};
