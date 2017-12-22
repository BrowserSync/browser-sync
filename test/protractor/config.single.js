
exports.config = {
    seleniumAddress: "http://localhost:4444/wd/hub",
    specs: [
        //process.env["BS_TEST_FILE"]
        //"tests/actions.clicks.js",
        "tests/actions.scroll.js",
        "tests/server.interactions.js",
        "tests/proxy.interactions.js",
        "tests/with.baseurl.js",
        "tests/with.baseurl.https.js"
        //"tests/with.socket.io.js"
    ]
};
