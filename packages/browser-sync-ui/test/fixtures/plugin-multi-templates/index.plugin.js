const PLUGIN_NAME = "Test BS Plugin";

module.exports = {
    "plugin:name": PLUGIN_NAME,
    "plugin": function (opts, bs) {
        var logger = bs.getLogger(PLUGIN_NAME);
        bs.events.on("plugins:configure", function (data) {
            if (data.name === PLUGIN_NAME) {
                //console.log(data);
            }
        });
    }
};