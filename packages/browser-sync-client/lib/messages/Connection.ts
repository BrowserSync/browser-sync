import { Inputs } from "../index";
import { pluck } from "rxjs/operators/pluck";
import { of } from "rxjs/observable/of";
import { Observable } from "rxjs/Observable";
import * as Log from "../log";
import { withLatestFrom } from "rxjs/operators/withLatestFrom";
import { mergeMap } from "rxjs/operators/mergeMap";
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
