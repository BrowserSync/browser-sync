import { OutgoingSocketEvents } from "../socket-messages";
import * as ClickEvent from "./ClickEvent";
import { Inputs } from "../index";
import { pluck } from "rxjs/operators/pluck";
import { filter } from "rxjs/operators/filter";
import { map } from "rxjs/operators/map";
import { Observable } from "rxjs/Observable";
import { withLatestFrom } from "rxjs/operators/withLatestFrom";
import { setElementValue } from "../effects/set-element-value.effect";

export interface Payload {
    value: any;
    tagName: string;
    index: number;
}

export type OutgoingPayload = Payload;

export interface IncomingPayload extends OutgoingPayload {
    pathname: string;
}

export function outgoing(
    element: ClickEvent.ElementData,
    value: any
): [OutgoingSocketEvents.Keyup, OutgoingPayload] {
    return [
        OutgoingSocketEvents.Keyup,
        {
            ...element,
            value
        }
    ];
}

export function incomingKeyupHandler(
    xs: Observable<IncomingPayload>,
    inputs: Inputs
) {
    return xs.pipe(
        withLatestFrom(
            inputs.option$.pipe(pluck("ghostMode", "forms", "inputs")),
            inputs.window$.pipe(pluck("location", "pathname"))
        ),
        filter(([event, canKeyup, pathname]) => {
            return canKeyup && event.pathname === pathname;
        }),
        map(([event]) => setElementValue(event))
    );
}
