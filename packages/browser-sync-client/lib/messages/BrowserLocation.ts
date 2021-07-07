import { Inputs } from "../index";
import { filter, map, Observable, pluck, withLatestFrom } from "rxjs";
import { browserSetLocation } from "../effects/browser-set-location.effect";

export interface IncomingPayload {
    url?: string;
    path?: number;
}

export function incomingBrowserLocation(
    xs: Observable<IncomingPayload>,
    inputs: Inputs
) {
    return xs.pipe(
        withLatestFrom(inputs.option$.pipe(pluck("ghostMode", "location"))),
        filter(([, canSyncLocation]) => canSyncLocation === true),
        map(([event]) => browserSetLocation(event))
    );
}
