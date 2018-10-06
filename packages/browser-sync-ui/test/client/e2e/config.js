exports.config = {
    seleniumAddress: "http://localhost:4444/wd/hub",
    specs: [process.argv.slice(4, 5)[0].replace("test/client/e2e/", "")]
};