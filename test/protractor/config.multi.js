
exports.config = {
    seleniumAddress: "http://localhost:4444/wd/hub",
    baseUrl: process.env["BS_BASE"],
    specs: [
        "tests/snippet.injection.js"
    ]
};
