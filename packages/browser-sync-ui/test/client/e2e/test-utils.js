module.exports = {
    openWindow: function (browser, url) {
        browser.executeScript("window.open('%s')".replace("%s", url));
    }
};