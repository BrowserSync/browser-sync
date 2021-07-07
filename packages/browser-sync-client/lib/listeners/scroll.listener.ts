import { createTimedBooleanSwitch } from "../utils";
import { IncomingSocketNames, OutgoingSocketEvent } from "../socket-messages";
import {
    getScrollPosition,
    getScrollPositionForElement
} from "../browser.utils";
import { distinctUntilChanged, empty, filter, fromEvent, map, Observable, pluck, skip, switchMap, withLatestFrom } from "rxjs";
import * as ScrollEvent from "../messages/ScrollEvent";
import { Inputs } from "../index";

export function getScrollStream(
    window: Window,
    document: Document,
    socket$: Inputs["socket$"],
    option$: Inputs["option$"]
): Observable<OutgoingSocketEvent> {
    const canSync$ = createTimedBooleanSwitch(
        socket$.pipe(filter(([name]) => name === IncomingSocketNames.Scroll))
    );

    /**
     * If the option 'scrollElementMapping' is provided
     * we cache thw
     * @type {Observable<(Element | null)[]>}
     */
    const elemMap$ = option$.pipe(
        pluck("scrollElementMapping"),
        map((selectors: string[]) =>
            selectors.map(selector => document.querySelector(selector))
        )
    );

    return option$.pipe(
        skip(1), // initial option set before the connection event
        pluck("ghostMode", "scroll"),
        distinctUntilChanged(),
        switchMap(scroll => {
            if (!scroll) return empty();
            return (
                // NOTE: RxJS types are off here. (see issue: https://github.com/ReactiveX/rxjs/issues/6512).
                fromEvent(document as any, "scroll", true as any) as Observable<Event>
            ).pipe(
                map((e: Event) => e.target),
                withLatestFrom(canSync$, elemMap$),
                filter(([, canSync]) => Boolean(canSync)),
                map(([target, canSync, elemMap]: [any, boolean, any[]]) => {
                    if (target === document) {
                        return ScrollEvent.outgoing(
                            getScrollPosition(window, document),
                            "document",
                            0
                        );
                    }

                    const elems = document.getElementsByTagName(target.tagName);
                    const index = Array.prototype.indexOf.call(
                        elems || [],
                        target
                    );

                    return ScrollEvent.outgoing(
                        getScrollPositionForElement(target),
                        target.tagName,
                        index,
                        elemMap.indexOf(target)
                    );
                })
            );
        })
    );
}