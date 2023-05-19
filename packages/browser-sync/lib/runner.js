const Rx = require("rx");
import { toRunnerNotification } from "./types";

/**
 * @param {import("./types").RunnerOption} runner
 */
export function execRunner(runner) {
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
export function bsRunner(runner) {
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
    } else if (runner.bs === "inject-html") {
        effects.push({
            type: "inject-html",
            selectors: runner.selectors || []
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
export function shRunner(runner, params) {
    return Rx.Observable.concat(
        Rx.Observable.just(toRunnerNotification({ status: "start", effects: [], runner })),
        Rx.Observable.just(toRunnerNotification({ status: "end", effects: [], runner }))
    );
}

/**
 * @param {import("./types").Runner} runner
 */
export function npmRunner(runner) {
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
