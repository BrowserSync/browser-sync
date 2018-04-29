import { Inputs } from "../index";
import { filter } from "rxjs/operators/filter";
import { Observable } from "rxjs/Observable";
import { withLatestFrom } from "rxjs/operators/withLatestFrom";
import { mergeMap } from "rxjs/operators/mergeMap";
import { concat } from "rxjs/observable/concat";
import { of } from "rxjs/observable/of";
import {
    browserReload,
    preBrowserReload
} from "../effects/browser-reload.effect";
import { subscribeOn } from "rxjs/operators/subscribeOn";
import { async } from "rxjs/scheduler/async";

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
