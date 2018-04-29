import { Inputs } from "../index";
import { Observable } from "rxjs/Observable";
import { ignoreElements } from "rxjs/operators/ignoreElements";
import { tap } from "rxjs/operators/tap";
import { map } from "rxjs/operators/map";
import { EffectNames } from "../effects";
import { consoleInfo } from "../log";

/**
 * Set the local client options
 * @param xs
 * @param inputs
 */
export function setOptionsEffect(
    xs: Observable<IBrowserSyncOptions>,
    inputs: Inputs
) {
    return xs.pipe(
        tap(options => inputs.option$.next(options)),
        // map(() => consoleInfo('set options'))
        ignoreElements()
    );
}

export function setOptions(options: IBrowserSyncOptions) {
    return [EffectNames.SetOptions, options];
}
