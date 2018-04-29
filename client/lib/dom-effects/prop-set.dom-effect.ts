import { map } from "rxjs/operators/map";
import { tap } from "rxjs/operators/tap";
import { Observable } from "rxjs/Observable";
import { Events } from "../dom-effects";
import * as Log from "../log";

export interface PropSetPayload {
    target: Element;
    prop: string;
    value: string;
    pathname: string;
}

export function propSetDomEffect(xs: Observable<PropSetPayload>) {
    return xs.pipe(
        tap(event => {
            const { target, prop, value } = event;
            target[prop] = value;
        }),
        map(e =>
            Log.consoleInfo(`[PropSet]`, e.target, `${e.prop} = ${e.pathname}`)
        )
    );
}

export function propSet(incoming: PropSetPayload): [Events.PropSet, any] {
    return [Events.PropSet, incoming];
}
