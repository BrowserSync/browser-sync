"use strict";

var _         = require("lodash");
var Immutable = require("immutable");

var utils     = require("./utils");
var messages  = require("./messages");

module.exports = {
    /**
     * @param bs
     * @param done
     */
    getEmptyPort: function (bs, done) {
        utils.getPorts(bs.options, function (err, port) {
            if (err) {
                return utils.fail(true, err, bs.cb);
            }
            bs.debug("Found a free port: {magenta:%s", port);
            done(null, {
                options: {
                    port: port
                }
            });
        });
    },
    /**
     * @param {BrowserSync} bs
     * @param {Function} done
     */
    getOnlineStatus: function(bs, done) {
        if (_.isUndefined(bs.options.get("online")) && _.isUndefined(process.env.TESTING)) {
            require("dns").resolve("www.google.com", function (err) {
                var online = false;
                if (err) {
                    bs.debug("Could not resolve www.google.com, setting {magenta:online: false}");
                    return done(err);
                } else {
                    bs.debug("Resolved www.google.com, setting {magenta:online: true}");
                    online = true;
                }
                done(null, {
                    options: {
                        online: online
                    }
                });
            });
        } else {
            done();
        }
    },
    /**
     * @param bs
     * @param done
     */
    setOptions: function (bs, done) {
        done(null, {
            options: {
                urls:        utils.setUrlOptions(bs.options),
                files:       bs.pluginManager.hook("files:watch", bs, bs.options.get("files")),
                snippet:     messages.scriptTags(bs.options),
                scriptPaths: Immutable.fromJS(messages.clientScript(bs.options, true))
            }
        });
    },
    /**
     * @param {BrowserSync} bs
     * @param {Function} done
     */
    setInternalEvents: function (bs, done) {

        var events = {
            "file:changed": function (data) {
                if (!bs.paused && data.namespace === "core") {
                    if (_.isUndefined(data.log)) {
                        data.log = bs.options.get("logFileChanges");
                    }
                    bs.changeFile(data, options);
                }
            },
            "file:reload": function (data) {
                bs.doFileReload(data);
            },
            "browser:reload": function () {
                bs.doBrowserReload();
            },
            "browser:notify": function (data) {
                bs.io.sockets.emit("browser:notify", data);
            },
            /**
             * Things that happened after the service is running
             * @param data
             */
            "service:running": function (data) {

                if (data.type !== "snippet") {
                    utils.openBrowser(data.url, options);
                }

                // log about any file watching
                if (bs.watchers) {
                    bs.events.emit("file:watching", bs.watchers);
                }
            },
            "options:set": function (data) {
                if (bs.io) {
                    bs.io.sockets.emit("options:set", data);
                }
            },
            "init": function () {
                bs.active = true;
            },
            "plugins:configure": function (data) {
                if (data.active) {
                    bs.pluginManager.enablePlugin(data.name);
                } else {
                    bs.pluginManager.disablePlugin(data.name);
                }
                bs.options.userPlugins = bs.getUserPlugins();
            }
        };

        Object.keys(events).forEach(function (event) {
            bs.events.on(event, events[event]);
        });

        done();
    },
    startServer: function () {

    },
    setFileWatchers: function (bs, done) {
        this.setOption("files", this.pluginManager.hook("files:watch", this, this.options.get("files")));
        this.watchers = this.pluginManager.get("file:watcher")(this.options, this.events);
        done();
    }
};