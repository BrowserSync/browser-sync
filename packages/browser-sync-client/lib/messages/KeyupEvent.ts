import { OutgoingSocketEvents } from "../socket-messages";
import * as ClickEvent from "./ClickEvent";
import { Inputs } from "../index";
import { filter, map, Observable, pluck, withLatestFrom } from "rxjs";
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
