import { map, Observable } from "rxjs";
import * as Log from "../log";

export interface IncomingPayload {
    message: string;
    timeout: number;
    override?: boolean;
}

export function incomingBrowserNotify(xs: Observable<IncomingPayload>) {
    return xs.pipe(map(event => Log.overlayInfo(event.message, event.timeout)));
}
