// @ts-check
"use strict";

import { execRunner } from "./runner";

var utils = require("./utils");
var fileUtils = require("./file-utils");
var Rx = require("rx");
var z = require("zod");
var fromEvent = Rx.Observable.fromEvent;
var fileHandler = require("./file-event-handler");
const {
    toRunnerOption,
    toRunnerNotification,
    toSideEffect,
    FileChangedEvent,
    toReloadEvent
} = require("./types");

export default function internalEvents(bs) {
    var events = {
        /**
         * File reloads
         * @param data
         */
        "file:reload": function(data) {
            bs.io.sockets.emit("file:reload", data);
        },
        /**
         * Browser Reloads
         */
        "browser:reload": function() {
            bs.io.sockets.emit("browser:reload");
        },
        /**
         * HTML Injection
         */
        "browser:inject-html": function(data) {
            bs.io.sockets.emit("browser:inject-html", data);
        },
        /**
         * Browser Notify
         * @param data
         */
        "browser:notify": function(data) {
            bs.io.sockets.emit("browser:notify", data);
        },
        /**
         * Things that happened after the service is running
         * @param data
         */
        "service:running": function(data) {
            var mode = bs.options.get("mode");
            var open = bs.options.get("open");

            if (mode === "proxy" || mode === "server" || open === "ui" || open === "ui-external") {
                utils.openBrowser(data.url, bs.options, bs);
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
        "options:set": function(data) {
            if (bs.io) {
                bs.io.sockets.emit("options:set", data);
            }
        },
        /**
         * Plugin configuration setting
         * @param data
         */
        "plugins:configure": function(data) {
            if (data.active) {
                bs.pluginManager.enablePlugin(data.name);
            } else {
                bs.pluginManager.disablePlugin(data.name);
            }
            bs.setOption("userPlugins", bs.getUserPlugins());
        },
        "plugins:opts": function(data) {
            if (bs.pluginManager.pluginOptions[data.name]) {
                bs.pluginManager.pluginOptions[data.name] = data.opts;
                bs.setOption("userPlugins", bs.getUserPlugins());
            }
        }
    };

    Object.keys(events).forEach(function(event) {
        bs.events.on(event, events[event]);
    });

    var reloader = fileHandler
        .applyReloadOperators(fromEvent(bs.events, "_browser:reload"), bs.options)
        .subscribe(function() {
            bs.events.emit("browser:reload");
        });

    var coreNamespacedWatchers = fromEvent(bs.events, "file:changed")
        .filter(function() {
            return bs.options.get("codeSync");
        })
        .filter(function(x) {
            return x.namespace === "core";
        });

    var handler = fileHandler
        .fileChanges(coreNamespacedWatchers, bs.options)
        .map(function(/** @type {FileChangedEvent[]} */ items) {
            const paths = items.map(x => x.path);
            console.log(JSON.stringify(items, null, 2));

            if (utils.willCauseReload(paths, bs.options.get("injectFileTypes").toJS())) {
                return toSideEffect({
                    type: "reload",
                    files: items
                });
            }
            return toSideEffect({
                type: "inject",
                files: items
            });
        })
        .subscribe(function(/** @type {import("./types").BsSideEffect} */ effect) {
            bsSideEffect(effect);
        });

    const runnerWatchers = fromEvent(bs.events, "file:changed").filter(function(x) {
        return x.namespace?.startsWith("__unstable_runner");
    });

    var runnerHandler = fileHandler
        .fileChanges(runnerWatchers, bs.options)
        .flatMapFirst(
            /** @type {FileChangedEvent[]} */ events => {
                if (!events || events.length === 0) {
                    console.log("missing events..");
                    return Rx.Observable.empty();
                }
                const uniqueCount = new Set(events.map(e => e.index)).size;

                if (uniqueCount > 1) {
                    console.warn("overlapping watchers not supported yet");
                    return Rx.Observable.empty();
                }

                const matchingRunner = bs.options
                    .get("runners")
                    .get(events[0].index)
                    .toJS();

                const parsed = toRunnerOption(matchingRunner);
                if (!parsed) return Rx.Observable.empty();

                const runner = execRunner(parsed);
                return runner.catch(e => {
                    // todo: handle/print errors nicely
                    bs.events.emit("runners:runtime-error", { runner, error: e });
                    return Rx.Observable.empty();
                });
            }
        )
        .subscribe(sideEffects);

    function sideEffects(/** @type {import("./types").RunnerNotification} */ statusNotification) {
        switch (statusNotification.status) {
            case "start": {
                console.log(statusNotification);
                break;
            }
            case "end": {
                statusNotification.effects.forEach(effect => {
                    console.log("effect...", effect);
                    bsSideEffect(effect);
                });
                break;
            }
        }
    }

    /**
     * @param {import("./types").BsSideEffect} effect
     */
    function bsSideEffect(effect) {
        switch (effect.type) {
            case "inject-html": {
                bs.events.emit("browser:inject-html", { selectors: effect.selectors });
                break;
            }
            case "reload": {
                bs.events.emit(
                    "browser:reload",
                    toReloadEvent({
                        files: effect.files
                    })
                );
                break;
            }
            case "inject": {
                effect.files.forEach(function(data) {
                    if (!bs.paused) {
                        const injectInfo = fileUtils.getInjectFileInfo(data, bs.options);
                        bs.events.emit("file:reload", injectInfo);
                    }
                });
                break;
            }
        }
    }

    bs.registerCleanupTask(function() {
        handler.dispose();
        reloader.dispose();
        runnerHandler.dispose();
    });
}
