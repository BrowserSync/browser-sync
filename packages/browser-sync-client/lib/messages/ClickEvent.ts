import { OutgoingSocketEvents } from "../socket-messages";
import { Inputs } from "../index";
import { filter, map, Observable, pluck, withLatestFrom } from "rxjs";
import { simulateClick } from "../effects/simulate-click.effect";

export interface ElementData {
    tagName: string;
    index: number;
}

export interface IncomingPayload extends ElementData {
    pathname: string;
}

export function outgoing(
    data: ElementData
): [OutgoingSocketEvents.Click, ElementData] {
    return [OutgoingSocketEvents.Click, data];
}

export function incomingHandler$(
    xs: Observable<IncomingPayload>,
    inputs: Inputs
) {
    return xs.pipe(
        withLatestFrom(
            inputs.option$.pipe(pluck("ghostMode", "clicks")),
            inputs.window$.pipe(pluck("location", "pathname"))
        ),
        filter(([event, canClick, pathname]) => {
            return canClick && event.pathname === pathname;
        }),
        map(([event]) => {
            return simulateClick(event);
        })
    );
}
