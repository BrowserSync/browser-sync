import { getBrowserScrollPosition } from "./browser.utils";
import { EffectNames } from "./effects";
import { Observable } from "rxjs/Observable";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Inputs } from "./index";
import { empty } from "rxjs/observable/empty";
import { of } from "rxjs/observable/of";
import * as Log from "./log";
import { withLatestFrom } from "rxjs/operators/withLatestFrom";
import { map } from "rxjs/operators/map";
import { setWindowName } from "./dom-effects/set-window-name.dom-effect";
import { setScroll } from "./dom-effects/set-scroll.dom-effect";

export const PREFIX = "<<BS_START>>";
export const SUFFIX = "<<BS_START>>";
export const regex = new RegExp(PREFIX + "(.+?)" + SUFFIX, "g");

function parseFromString(input: string): any {
    var match;
    var last;
    while ((match = regex.exec(input))) {
        last = match[1];
    }
    if (last) {
        return JSON.parse(last);
    }
}

export function initWindowName(window: Window) {
    const saved = (() => {
        /**
         * On page load, check window.name for an existing
         * BS json blob & parse it.
         */
        try {
            return parseFromString(window.name);
        } catch (e) {
            return {};
        }
    })();

    /**
     * Remove any existing BS json from window.name
     * to ensure we don't interfere with any other
     * libs who may be using it.
     */
    window.name = window.name.replace(regex, "");

    /**
     * If the JSON was parsed correctly, try to
     * find a scroll property and restore it.
     */
    if (saved && saved.bs && saved.bs.hardReload && saved.bs.scroll) {
        const { x, y } = saved.bs.scroll;
        return of<any>(
            setScroll(x, y),
            Log.consoleDebug(`[ScrollRestore] x = ${x} y = ${y}`)
        );
    }
    return empty();
}

export const scrollRestoreHandlers$ = new BehaviorSubject({
    // [EffectNames.SetOptions]: (xs, inputs: Inputs) => {
    //     return xs.pipe(
    //         withLatestFrom(inputs.window$),
    //         take(1),
    //         mergeMap(([options, window]) => {
    //             if (options.scrollRestoreTechnique === "window.name") {
    //                 return initWindowName(window);
    //             }
    //             return empty();
    //         })
    //     );
    // },
    /**
     * Save the current scroll position
     * before the browser is reloaded (via window.location.reload(true))
     * @param xs
     * @param {Inputs} inputs
     */
    [EffectNames.PreBrowserReload]: (xs: Observable<any>, inputs: Inputs) => {
        return xs.pipe(
            withLatestFrom(inputs.window$, inputs.document$),
            map(([, window, document]) => {
                return [
                    window.name,
                    PREFIX,
                    JSON.stringify({
                        bs: {
                            hardReload: true,
                            scroll: getBrowserScrollPosition(window, document)
                        }
                    }),
                    SUFFIX
                ].join("");
            }),
            map(value => setWindowName(value))
        );
    }
});
