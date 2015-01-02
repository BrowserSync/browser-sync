"use strict";

var _         = require("lodash");
var Immutable = require("immutable");

var utils     = require("./utils");
var connectUtils  = require("./connect-utils");

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
    getOnlineStatus: function (bs, done) {
        if (_.isUndefined(bs.options.get("online")) && _.isUndefined(process.env.TESTING)) {
            require("dns").resolve("www.google.com", function (err) {
                var online = false;
                if (err) {
                    bs.debug("Could not resolve www.google.com, setting {magenta:online: false}");
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
                urls:        utils.getUrlOptions(bs.options),
                files:       bs.pluginManager.hook("files:watch", bs.options.get("files"), bs.pluginManager.pluginOptions),
                snippet:     connectUtils.scriptTags(bs.options),
                scriptPaths: Immutable.fromJS(connectUtils.clientScript(bs.options, true)),
                mode:        (function () {
                    if (bs.options.get("server")) {
                        return "server";
                    }
                    if (bs.options.get("proxy")) {
                        return "proxy";
                    }
                    return "snippet";
                })()
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
                    bs.changeFile(data, bs.options);
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
                    utils.openBrowser(data.url, bs.options);
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
                bs.setOption("userPlugins", bs.getUserPlugins());
            }
        };

        Object.keys(events).forEach(function (event) {
            bs.events.on(event, events[event]);
        });

        done();
    },
    /**
     * @param {BrowserSync} bs
     * @param {Function} done
     */
    setFileWatchers: function (bs, done) {
        done(null, {
            instance: {
                watchers: bs.pluginManager.get("file:watcher")(bs.options, bs.events)
            }
        });
    },
    /**
     * @param {BrowserSync} bs
     * @param {Function} done
     */
    startServer: function (bs, done) {

        var clientJs = bs.pluginManager.hook("client:js", {
            port: bs.options.get("port"),
            options: bs.options
        });

        var server = bs.pluginManager.get("server")(bs,
            bs.pluginManager.get("client:script")(bs.options.toJS(), clientJs, bs.options.get("proxy") ? "file" : "middleware")
        );

        done(null, {
            instance: {
                clientJs: clientJs,
                server: server
            }
        });
    },
    /**
     * @param {BrowserSync} bs
     * @param {Function} done
     */
    startTunnel: function (bs, done) {
        if (bs.options.get("tunnel") && bs.options.get("online")) {
            var localTunnel = require("./tunnel");
            localTunnel(bs, function (err, tunnel) {
                if (err) {
                    done(err);
                } else {
                    done(null, {
                        optionsIn: [
                            {
                                path:  ["urls", "tunnel"],
                                value: tunnel.url
                            }
                        ],
                        instance: {
                            tunnel: tunnel
                        }
                    });
                }
            });
        } else {
            done();
        }
    },
    /**
     * @param {BrowserSync} bs
     * @param {Function} done
     */
    startSockets: function (bs, done) {

        var clientEvents = bs.pluginManager.hook("client:events", bs.clientEvents); // todo - Immutable?

        // Start the socket, needs an existing server.
        var io = bs.pluginManager.get("socket")(
            bs.server,
            clientEvents,
            bs
        );

        done(null, {
            instance: {
                clientEvents: clientEvents,
                io: io
            }
        });
    },
    /**
     * @param {BrowserSync} bs
     * @param {Function} done
     */
    initUserPlugins: function (bs, done) {

        bs.pluginManager.initUserPlugins(bs);

        done(null, {
            options: {
                userPlugins: bs.getUserPlugins()
            }
        });
    }
};
