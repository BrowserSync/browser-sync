import { Inputs } from "../index";
import { ignoreElements } from "rxjs/operators/ignoreElements";
import { withLatestFrom } from "rxjs/operators/withLatestFrom";
import { tap } from "rxjs/operators/tap";
import { Observable } from "rxjs/Observable";
import { Events } from "../dom-effects";

export function setWindowNameDomEffect(xs: Observable<string>, inputs: Inputs) {
    return xs.pipe(
        withLatestFrom(inputs.window$),
        tap(([value, window]) => (window.name = value)),
        ignoreElements()
    );
}

export function setWindowName(
    incoming: string
): [Events.SetWindowName, string] {
    return [Events.SetWindowName, incoming];
}
