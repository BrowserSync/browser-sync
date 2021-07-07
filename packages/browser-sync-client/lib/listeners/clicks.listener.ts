import { createTimedBooleanSwitch } from "../utils";
import { IncomingSocketNames, OutgoingSocketEvent } from "../socket-messages";
import { getElementData } from "../browser.utils";
import { distinctUntilChanged, EMPTY, filter, fromEvent, map, Observable, pluck, skip, switchMap, withLatestFrom } from "rxjs";
import * as ClickEvent from "../messages/ClickEvent";
import { Inputs } from "../index";

export function getClickStream(
    document: Document,
    socket$: Inputs["socket$"],
    option$: Inputs["option$"]
): Observable<OutgoingSocketEvent> {
    const canSync$ = createTimedBooleanSwitch(
        socket$.pipe(filter(([name]) => name === IncomingSocketNames.Click))
    );

    return option$.pipe(
        skip(1), // initial option set before the connection event
        pluck("ghostMode", "clicks"),
        distinctUntilChanged(),
        switchMap(canClick => {
            if (!canClick) {
                return EMPTY;
            }
            return (
                // NOTE: RxJS types are off here. (see issue: https://github.com/ReactiveX/rxjs/issues/6512).
                fromEvent(
                    document as any, 
                    "click", 
                    { useCapture: true } as any
                ) as Observable<MouseEvent>
            ).pipe(
                map((e) => e.target),
                filter((target: any) => {
                    if (target.tagName === "LABEL") {
                        const id = target.getAttribute("for");
                        if (id && document.getElementById(id)) {
                            return false;
                        }
                    }
                    return true;
                }),
                withLatestFrom(canSync$),
                filter(([, canSync]) => canSync),
                map(([target]): OutgoingSocketEvent => {
                    return ClickEvent.outgoing(getElementData(target));
                })
            );
        })
    );
}
