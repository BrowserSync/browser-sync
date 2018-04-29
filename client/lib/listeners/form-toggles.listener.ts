import { IncomingSocketNames, OutgoingSocketEvent } from "../socket-messages";
import { getElementData } from "../browser.utils";
import { Observable } from "rxjs/Observable";
import { createTimedBooleanSwitch } from "../utils";
import * as FormToggleEvent from "../messages/FormToggleEvent";
import { filter } from "rxjs/operators/filter";
import { skip } from "rxjs/operators/skip";
import { pluck } from "rxjs/operators/pluck";
import { distinctUntilChanged } from "rxjs/operators/distinctUntilChanged";
import { withLatestFrom } from "rxjs/operators/withLatestFrom";
import { map } from "rxjs/operators/map";
import { switchMap } from "rxjs/operators/switchMap";
import { Inputs } from "../index";
import { empty } from "rxjs/observable/empty";
import { fromEvent } from "rxjs/observable/fromEvent";

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
            return fromEvent(document, "change", true).pipe(
                map((e: Event) => e.target || e.srcElement),
                filter((elem: HTMLInputElement) => elem.tagName === "SELECT"),
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
