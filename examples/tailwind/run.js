require("source-map-support").install();
const bs = require("../../packages/browser-sync/dist/index").create();
bs.init(
    {
        server: ".",
        open: false,
        notify: true,
        injectNotification: "console",
        runners: [
            {
                at: "startup",
                run: [{ npm: ["clean", "build"] }]
            },
            {
                at: "runtime",
                when: [{ files: ["*.html", "tailwind.config.js"] }],
                run: [
                    { npm: ["build"] },
                    { bs: "inject-html", selectors: ["body"] },
                    { bs: "inject", files: ["*.css"] }
                ]
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
