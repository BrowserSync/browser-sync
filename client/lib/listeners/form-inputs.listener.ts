import { IncomingSocketNames, OutgoingSocketEvent } from "../socket-messages";
import { getElementData } from "../browser.utils";
import { Observable } from "rxjs/Observable";
import { createTimedBooleanSwitch } from "../utils";
import * as KeyupEvent from "../messages/KeyupEvent";
import { filter } from "rxjs/operators/filter";
import { withLatestFrom } from "rxjs/operators/withLatestFrom";
import { map } from "rxjs/operators/map";
import { pluck } from "rxjs/operators/pluck";
import { skip } from "rxjs/operators/skip";
import { distinctUntilChanged } from "rxjs/operators/distinctUntilChanged";
import { switchMap } from "rxjs/operators/switchMap";
import { empty } from "rxjs/observable/empty";
import { fromEvent } from "rxjs/observable/fromEvent";
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
                return empty();
            }
            return fromEvent(document.body, "keyup", true).pipe(
                map((e: Event) => e.target || e.srcElement),
                filter(
                    (target: Element) =>
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
