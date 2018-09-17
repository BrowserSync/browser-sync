import { ignoreElements } from "rxjs/operators/ignoreElements";
import { Observable } from "rxjs/Observable";
import { tap } from "rxjs/operators/tap";

export function incomingDisconnect(xs: Observable<any>) {
    return xs.pipe(tap(x => console.log(x)), ignoreElements());
}
