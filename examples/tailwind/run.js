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
                files: ["index.html"],
                run: [{ npm: ["build"] }, { bs: "reload" }]
            }
        ]
    },
    (err, bs) => {
        // console.log(err);
        console.log(bs.options.get("urls").toJS());
    }
);
