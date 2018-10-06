import { map } from "rxjs/operators/map";
import { Observable } from "rxjs/Observable";
import { setOptions } from "../effects/set-options.effect";
import { tap } from "rxjs/operators/tap";

export interface Payload {
    options: IBrowserSyncOptions;
    path: string[];
    value: any;
}

type IncomingPayload = Payload;

export function incomingOptionsSet(xs: Observable<IncomingPayload>) {
    return xs.pipe(map(event => setOptions(event.options)));
}
