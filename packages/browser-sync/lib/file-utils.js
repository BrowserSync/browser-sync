// @ts-check
"use strict";
// @ts-expect-error
var _ = require("./lodash.custom");

var fileUtils = {
    /**
     * @param data
     * @param options
     * @returns {import("./types").InjectFileInfo}
     */
    getInjectFileInfo: function(data, options) {
        data.ext = require("path")
            .extname(data.path)
            .slice(1);
        data.basename = require("path").basename(data.path);

        var obj = {
            ext: data.ext,
            path: data.path,
            basename: data.basename,
            event: data.event,
            type: /** @type {const} */ ("inject")
        };

        obj.path = data.path;
        obj.log = data.log;

        // RELOAD page
        if (!_.includes(options.get("injectFileTypes").toJS(), obj.ext)) {
            return {
                ...obj,
                url: obj.path,
                type: "reload"
            };
        }
        return obj;
    }
};

module.exports = fileUtils;
