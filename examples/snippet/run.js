const bs = require("../../packages/browser-sync/dist/index").create();
bs.init(
    {
        server: ".",
        open: false,
        notify: false,
        watch: true,
        snippetOptions: {
            rule: {
                match: /<\/head>/i,
                fn: function (snippet, match) {
                    return snippet + match;
                },
            },
        },
    },
    (err, bs) => {
        const message = { kind: 'ready', urls: bs.options.get("urls").toJS() };
        if (process.send) {
            process.send(message)
        } else {
            console.log(message);
        }
    }
);
