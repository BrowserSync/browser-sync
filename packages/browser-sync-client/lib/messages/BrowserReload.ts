import { Inputs } from "../index";
import { filter } from "rxjs/operators/filter";
import { Observable } from "rxjs/Observable";
import { withLatestFrom } from "rxjs/operators/withLatestFrom";
import { mergeMap } from "rxjs/operators/mergeMap";
import { concat } from "rxjs/observable/concat";
import { of } from "rxjs/observable/of";
import { browserReload, preBrowserReload } from "../effects/browser-reload.effect";
import { subscribeOn } from "rxjs/operators/subscribeOn";
import { async } from "rxjs/scheduler/async";
import { browserInjectHTML } from "../effects/browser-inject-html.effect";
import { map } from "rxjs/operators/map";

export function incomingBrowserReload(xs: Observable<any>, inputs: Inputs) {
    return xs.pipe(
        withLatestFrom(inputs.option$),
        filter(([event, options]) => options.codeSync),
        mergeMap(reloadBrowserSafe)
    );
}

export function reloadBrowserSafe() {
    return concat(
        /**
         * Emit a warning message allowing others to do some work
         */
        of(preBrowserReload()),
        /**
         * On the next tick, perform the reload
         */
        of(browserReload()).pipe(subscribeOn(async))
    );
}

export function incomingBrowserInjectHTML(xs: Observable<any>, inputs: Inputs) {
    return xs.pipe(
        withLatestFrom(inputs.option$, inputs.window$),
        filter(([event, options, window]) => {
            // bail early if fetch is not available
            if (typeof window.fetch === "undefined") {
                return false;
            }
            // otherwise, just check that codeSync is enabled
            return options.codeSync;
        }),
        map(([event]) => browserInjectHTML(event))
    );
}
