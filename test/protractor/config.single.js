"use strict";

exports.config = {
    seleniumAddress: "http://localhost:4444/wd/hub",
    specs: [
        //"tests/actions.scroll.js",
        //"tests/actions.clicks.js",
        "tests/server.interactions.js",
        "tests/proxy.interactions.js",
        "tests/with.socket.io.js"
    ]
};
