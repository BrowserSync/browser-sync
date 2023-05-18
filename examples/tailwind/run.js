require("source-map-support").install();
const bs = require("../../packages/browser-sync/dist/index").create();
bs.init(
    {
        server: ".",
        open: false,
        notify: false,
        runners: [
            {
                at: "startup",
                run: [{ npm: ["clean", "build"] }]
            },
            {
                at: "runtime",
                when: [{ files: ["index.html"] }],
                run: [{ npm: ["build"] }, { bs: "reload" }]
            }
        ]
    },
    (err, bs) => {
        const message = {
            kind: "ready",
            urls: bs.options.get("urls").toJS(),
            cwd: __dirname
        };
        process.send?.(message);
    }
);
