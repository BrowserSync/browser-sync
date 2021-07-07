import { map, Observable, tap } from "rxjs";
import { Events } from "../dom-effects";
import * as Log from "../log";

export interface StyleSetPayload {
    style: string;
    styleName: string;
    value: string;
    newValue: string;
    pathName: string;
}

export function styleSetDomEffect(xs: Observable<StyleSetPayload>) {
    return xs.pipe(
        tap(event => {
            const { style, styleName, newValue } = event;
            style[styleName] = newValue;
        }),
        map(e => Log.consoleInfo(`[StyleSet] ${e.styleName} = ${e.pathName}`))
    );
}

export function styleSet(incoming: StyleSetPayload): [Events.StyleSet, any] {
    return [Events.StyleSet, incoming];
}
