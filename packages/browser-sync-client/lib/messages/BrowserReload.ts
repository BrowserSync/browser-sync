import { Inputs } from "../index";
import { async, concat, filter, mergeMap, Observable, of, subscribeOn, withLatestFrom } from "rxjs";
import {
    browserReload,
    preBrowserReload
} from "../effects/browser-reload.effect";

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
