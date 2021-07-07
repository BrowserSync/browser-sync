import { map, Observable } from "rxjs";
import { setOptions } from "../effects/set-options.effect";

export interface Payload {
    options: IBrowserSyncOptions;
    path: string[];
    value: any;
}

type IncomingPayload = Payload;

export function incomingOptionsSet(xs: Observable<IncomingPayload>) {
    return xs.pipe(map(event => setOptions(event.options)));
}
