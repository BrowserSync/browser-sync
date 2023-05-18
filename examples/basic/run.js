const bs = require("../../packages/browser-sync/dist/index").create();
const path = require("path");
const serverDir = path.join(__dirname, "..", "..", "packages/browser-sync/test/fixtures");

bs.init(
    {
        server: serverDir,
        open: false,
        watch: true,
        online: false
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
