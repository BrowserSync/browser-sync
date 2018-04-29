import { Inputs } from "../index";
import { pluck } from "rxjs/operators/pluck";
import { filter } from "rxjs/operators/filter";
import { map } from "rxjs/operators/map";
import { Observable } from "rxjs/Observable";
import { withLatestFrom } from "rxjs/operators/withLatestFrom";
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
