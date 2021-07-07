import { OutgoingSocketEvents } from "../socket-messages";
import { Inputs } from "../index";
import { filter, map, Observable, pluck, withLatestFrom } from "rxjs";
import { EffectNames } from "../effects";

export interface ICoords {
    x: number;
    y: number;
}

export interface Data {
    raw: ICoords;
    proportional: number;
}

export interface OutgoingPayload {
    position: Data;
    tagName: string;
    index: number;
    mappingIndex: number;
}

export interface IncomingPayload extends OutgoingPayload {
    override?: boolean;
    pathname: string;
}

export function outgoing(
    data: Data,
    tagName: string,
    index: number,
    mappingIndex: number = -1
): [OutgoingSocketEvents.Scroll, OutgoingPayload] {
    return [
        OutgoingSocketEvents.Scroll,
        { position: data, tagName, index, mappingIndex }
    ];
}

export function incomingScrollHandler(
    xs: Observable<IncomingPayload>,
    inputs: Inputs
) {
    return xs.pipe(
        withLatestFrom(
            inputs.option$.pipe(pluck("ghostMode", "scroll")),
            inputs.window$.pipe(pluck("location", "pathname"))
        ),
        filter(([event, canScroll, pathname]) => {
            return canScroll && event.pathname === pathname;
        }),
        map(([event]) => {
            return [EffectNames.BrowserSetScroll, event];
        })
    );
}
