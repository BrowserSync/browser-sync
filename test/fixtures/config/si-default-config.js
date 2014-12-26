module.exports = {
    logLevel: "info",
    files: "test/fixtures/assets/style.css",
    background: false,
    defaultConfig: true,
    reloadFileTypes: ['php', 'html', 'js', 'erb'],
    injectFileTypes: ['css', 'png', 'jpg', 'svg', 'gif'],
    host: null,
    ghostMode: {
        links: false,
        forms: false,
        scroll: false
    },
    server: false,
    open: true,
    notify: true
};