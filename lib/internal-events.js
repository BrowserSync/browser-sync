"use strict";

var utils = require("./utils");
var _     = require("lodash");

module.exports = function (bs) {

    var events = {
        /**
         * File changes
         */
        "file:changed": changedFile.bind(null, bs),
        /**
         * File reloads
         * @param data
         */
        "file:reload": function (data) {
            bs.doFileReload(data);
        },
        /**
         * Browser Reloads
         */
        "browser:reload": function () {
            bs.doBrowserReload();
        },
        /**
         * Browser Notify
         * @param data
         */
        "browser:notify": function (data) {
            bs.io.sockets.emit("browser:notify", data);
        },
        /**
         * Things that happened after the service is running
         * @param data
         */
        "service:running": function (data) {

            if (data.type !== "snippet") {
                utils.openBrowser(data.url, bs.options);
            }

            // log about any file watching
            if (bs.watchers) {
                bs.events.emit("file:watching", bs.watchers);
            }
        },
        /**
         * Option setting
         * @param data
         */
        "options:set": function (data) {
            if (bs.io) {
                bs.io.sockets.emit("options:set", data);
            }
        },
        /**
         * Plugin configuration setting
         * @param data
         */
        "plugins:configure": function (data) {
            if (data.active) {
                bs.pluginManager.enablePlugin(data.name);
            } else {
                bs.pluginManager.disablePlugin(data.name);
            }
            bs.setOption("userPlugins", bs.getUserPlugins());
        }
    };

    Object.keys(events).forEach(function (event) {
        bs.events.on(event, events[event]);
    });
};

/**
 * React to file-change events that occur on "core" namespace only
 * @param bs
 * @param data
 */
function changedFile(bs, data) {
    if (!bs.paused && data.namespace === "core") {
        if (_.isUndefined(data.log)) {
            data.log = bs.options.get("logFileChanges");
        }
        bs.events.emit("file:reload", getFileInfo(bs, data, bs.options));
    }
}

/**
 * @param bs
 * @param data
 * @param options
 * @returns {{assetFileName: *, fileExtension: String}}
 */
function getFileInfo (bs, data, options) {

    var path     = data.path;
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

    obj.cwd  = bs.cwd;
    obj.path = path;
    obj.type = type;
    obj.log  = data.log;

    return obj;
}
