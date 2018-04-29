import { createTimedBooleanSwitch } from "../utils";
import { IncomingSocketNames, OutgoingSocketEvent } from "../socket-messages";
import {
    getScrollPosition,
    getScrollPositionForElement
} from "../browser.utils";
import { Observable } from "rxjs/Observable";
import * as ScrollEvent from "../messages/ScrollEvent";
import { filter } from "rxjs/operators/filter";
import { map } from "rxjs/operators/map";
import { withLatestFrom } from "rxjs/operators/withLatestFrom";
import { Inputs } from "../index";
import { pluck } from "rxjs/operators/pluck";
import { distinctUntilChanged } from "rxjs/operators/distinctUntilChanged";
import { switchMap } from "rxjs/operators/switchMap";
import { empty } from "rxjs/observable/empty";
import { skip } from "rxjs/operators/skip";
import { fromEvent } from "rxjs/observable/fromEvent";

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
            return fromEvent(document, "scroll", true).pipe(
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
