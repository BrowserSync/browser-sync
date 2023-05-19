const bs = require("../../packages/browser-sync/dist/index").create();
const serverDir = __dirname;

bs.init(
    {
        server: serverDir,
        open: false,
        online: false,
        runners: [
            {
                at: "runtime",
                when: [{ files: ["*.html"] }],
                run: [
                    { bs: "inject-html" }
                ]
            },
            {
                at: "runtime",
                when: [{ files: ["*.css"] }],
                run: [
                    { bs: "inject", files: ["*.css"] }
                ]
            }
        ]
    },
    (err, bs) => {
        const message = {
            kind: "ready",
            urls: bs.options.get("urls").toJS(),
            cwd: serverDir
        };
        if (process.send) {
            process.send(message);
        } else {
            console.log(message);
        }
    }
);
