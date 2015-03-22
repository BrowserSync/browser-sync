"use strict";

var _         = require("lodash");
var utils     = require("./utils");

var fileUtils = {

    /**
     * React to file-change events that occur on "core" namespace only
     * @param bs
     * @param data
     */
    changedFile: function (bs, data) {
        if (data.event === "change") {
            if (!bs.paused && data.namespace === "core") {
                if (_.isUndefined(data.log)) {
                    data.log = bs.options.get("logFileChanges");
                }
                bs.events.emit("file:reload", fileUtils.getFileInfo(data, bs.options));
            }
        }
    },
    /**
     * @param data
     * @param options
     * @returns {{assetFileName: *, fileExtension: String}}
     */
    getFileInfo: function (data, options) {

        var path = data.path;
        var fileName = require("path").basename(path);

        var fileExtension = utils.getFileExtension(path);

        var obj = {
            assetFileName: fileName,
            fileExtension: fileExtension
        };

        var type = "inject";

        // RELOAD page
        if (!_.contains(options.get("injectFileTypes").toJS(), fileExtension)) {
            obj.url = path;
            type = "reload";
        }

        obj.path = path;
        obj.type = type;
        obj.log = data.log;

        return obj;
    }
};

module.exports = fileUtils;
