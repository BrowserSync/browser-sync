exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    baseUrl: process.env["BS_BASE"],
    specs: [
        'e2e.home.js',
    ]
};