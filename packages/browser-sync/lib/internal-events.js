// @ts-check
"use strict";

var utils = require("./utils");
var fileUtils = require("./file-utils");
var Rx = require("rx");
var z = require("zod");
var fromEvent = Rx.Observable.fromEvent;
var fileHandler = require("./file-event-handler");
const {
    runnerOption,
    toRunnerOption,
    toRunnerNotification,
    toSideEffect,
    FileChangedEvent,
    toReloadEvent
} = require("./types");

module.exports = function(bs) {
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
};

/**
 * @param {import("./types").RunnerOption} runner
 */
function execRunner(runner) {
    return Rx.Observable.concat(
        runner.run.map(r => {
            if ("bs" in r) {
                return bsRunner(r);
            }
            if ("sh" in r) {
                let cmd;
                if (typeof r.sh === "string") {
                    cmd = r.sh;
                } else if ("cmd" in r.sh) {
                    cmd = r.sh.cmd;
                } else {
                    return Rx.Observable.throw(new Error("invalid `sh` config"));
                }
                return shRunner(r, {
                    cmd: cmd
                });
            }
            if ("npm" in r) {
                return npmRunner(r);
            }
            throw new Error("unreachable");
        })
    );
}

/**
 * @param {import("./types").Runner} runner
 */
function bsRunner(runner) {
    if (!("bs" in runner)) throw new Error("unreachable");
    /** @type {import("./types").BsSideEffect[]} */
    const effects = [];
    if (runner.bs === "inject") {
        effects.push({
            type: "inject",
            files: runner.files.map(f => {
                return {
                    path: f,
                    event: "bs-runner"
                };
            })
        });
    } else if (runner.bs === "reload") {
        effects.push({
            type: "reload",
            files: []
        });
    }
    return Rx.Observable.concat(
        Rx.Observable.just(
            toRunnerNotification({
                status: "start",
                effects: [],
                runner
            })
        ),
        Rx.Observable.just(
            toRunnerNotification({
                status: "end",
                effects: effects,
                runner
            })
        )
    );
}

/**
 * @param {import("./types").Runner} runner
 * @param {object} params
 * @param {string} params.cmd
 */
function shRunner(runner, params) {
    return Rx.Observable.concat(
        Rx.Observable.just(toRunnerNotification({ status: "start", effects: [], runner })),
        Rx.Observable.just(toRunnerNotification({ status: "end", effects: [], runner }))
    );
}

/**
 * @param {import("./types").Runner} runner
 */
function npmRunner(runner) {
    if (!("npm" in runner)) throw new Error("unreachble");
    return Rx.Observable.just(runner).flatMap(runner => {
        try {
            const runAll = require("npm-run-all");
            const runAllRunner = runAll(runner.npm, {
                parallel: false,
                stdout: process.stdout,
                stdin: process.stdin,
                stderr: process.stderr
            });
            const p = runAllRunner.then(results => {
                if (results.some(r => r.code !== 0)) throw new Error("failed");
                return results;
            });
            return Rx.Observable.fromPromise(p).map(results => {
                return toRunnerNotification({ status: "end", effects: [], runner });
            });
        } catch (e) {
            console.log("e", e);
            return Rx.Observable.throw(e);
        }
    });
}
