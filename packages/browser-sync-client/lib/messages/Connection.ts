import { Inputs } from "../index";
import { mergeMap, Observable, of, pluck, withLatestFrom } from "rxjs";
import * as Log from "../log";
import { setOptions } from "../effects/set-options.effect";

export function incomingConnection(
    xs: Observable<IBrowserSyncOptions>,
    inputs: Inputs
) {
    return xs.pipe(
        withLatestFrom(inputs.option$.pipe(pluck("logPrefix"))),
        mergeMap(([x, logPrefix]) => {

            const prefix = logPrefix
                ? `${logPrefix}: `
                : '';

            return of<any>(
                setOptions(x),
                Log.overlayInfo(`${prefix}connected`)
            );
        })
    );
}
