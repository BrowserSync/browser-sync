import { ignoreElements, Observable, tap } from "rxjs";

export function incomingDisconnect(xs: Observable<any>) {
    return xs.pipe(tap(x => console.log(x)), ignoreElements());
}
