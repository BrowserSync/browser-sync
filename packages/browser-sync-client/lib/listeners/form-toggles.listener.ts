import { IncomingSocketNames, OutgoingSocketEvent } from "../socket-messages";
import { getElementData } from "../browser.utils";
import { distinctUntilChanged, empty, filter, fromEvent, map, Observable, pluck, skip, switchMap, withLatestFrom } from "rxjs";
import { createTimedBooleanSwitch } from "../utils";
import * as FormToggleEvent from "../messages/FormToggleEvent";
import { Inputs } from "../index";

export function getFormTogglesStream(
    document: Document,
    socket$: Inputs["socket$"],
    option$: Inputs["option$"]
): Observable<OutgoingSocketEvent> {
    const canSync$ = createTimedBooleanSwitch(
        socket$.pipe(
            filter(([name]) => name === IncomingSocketNames.InputToggle)
        )
    );

    return option$.pipe(
        skip(1),
        pluck("ghostMode", "forms", "toggles"),
        distinctUntilChanged(),
        switchMap(canToggle => {
            if (!canToggle) {
                return empty();
            }
            return (
                // NOTE: RxJS types are off here. (see issue: https://github.com/ReactiveX/rxjs/issues/6512).
                fromEvent(document as any, "change", true as any) as Observable<Event>
            ).pipe(
                map((e) => (e.target || e.srcElement) as HTMLInputElement),
                filter((elem) => elem.tagName === "SELECT"),
                withLatestFrom(canSync$),
                filter(([, canSync]) => canSync),
                map(([elem, canSync]: [HTMLInputElement, boolean]) => {
                    const data = getElementData(elem);

                    return FormToggleEvent.outgoing(data, {
                        type: elem.type,
                        checked: elem.checked,
                        value: elem.value
                    });
                })
            );
        })
    );
}
