import { IncomingSocketNames, OutgoingSocketEvent } from "../socket-messages";
import { getElementData } from "../browser.utils";
import { distinctUntilChanged, EMPTY, filter, fromEvent, map, Observable, pluck, skip, switchMap, withLatestFrom } from "rxjs";
import { createTimedBooleanSwitch } from "../utils";
import * as KeyupEvent from "../messages/KeyupEvent";
import { Inputs } from "../index";

export function getFormInputStream(
    document: Document,
    socket$: Inputs["socket$"],
    option$: Inputs["option$"]
): Observable<OutgoingSocketEvent> {
    const canSync$ = createTimedBooleanSwitch(
        socket$.pipe(filter(([name]) => name === IncomingSocketNames.Keyup))
    );
    return option$.pipe(
        skip(1), // initial option set before the connection event
        pluck("ghostMode", "forms", "inputs"),
        distinctUntilChanged(),
        switchMap(formInputs => {
            if (!formInputs) {
                return EMPTY;
            }
            return (
                // NOTE: RxJS types are off here. (see issue: https://github.com/ReactiveX/rxjs/issues/6512).
                fromEvent(document.body as any, "keyup", true as any) as Observable<KeyboardEvent>
            ).pipe(
                map((e) => (e.target || e.srcElement) as HTMLInputElement),
                filter(
                    (target) =>
                        target.tagName === "INPUT" ||
                        target.tagName === "TEXTAREA"
                ),
                withLatestFrom(canSync$),
                filter(([, canSync]) => canSync),
                map(([eventTarget]) => {
                    const target = getElementData(eventTarget);
                    const value = eventTarget.value;

                    return KeyupEvent.outgoing(target, value);
                })
            );
        })
    );
}
