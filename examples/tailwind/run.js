require("source-map-support").install();
const bs = require("../../packages/browser-sync/dist/index").create();
bs.init(
    {
        server: ".",
        open: false,
        runners: [
            {
                files: ["index.html", "base.css"],
                run: [{ npm: ["build"] }, { bs: "reload" }]
            }
        ]
    },
    (err, bs) => {
        // console.log(err);
        console.log(bs.options.get("urls").toJS());
    }
);
