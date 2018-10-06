import { createTimedBooleanSwitch } from "../utils";
import { IncomingSocketNames, OutgoingSocketEvent } from "../socket-messages";
import { getElementData } from "../browser.utils";
import { Observable } from "rxjs/Observable";
import * as ClickEvent from "../messages/ClickEvent";
import { withLatestFrom } from "rxjs/operators/withLatestFrom";
import { filter } from "rxjs/operators/filter";
import { map } from "rxjs/operators/map";
import { Inputs } from "../index";
import { pluck } from "rxjs/operators/pluck";
import { skip } from "rxjs/operators/skip";
import { distinctUntilChanged } from "rxjs/operators/distinctUntilChanged";
import { switchMap } from "rxjs/operators/switchMap";
import { fromEvent } from "rxjs/observable/fromEvent";
import { empty } from "rxjs/observable/empty";

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
                return empty();
            }
            return fromEvent(document, "click", true).pipe(
                map((e: Event) => e.target),
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
