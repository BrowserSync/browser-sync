import { IncomingPayload } from "../messages/ScrollEvent";
import { Inputs } from "../index";
import { ignoreElements, map, merge, Observable, partition, pluck, tap, withLatestFrom } from "rxjs";
import { getDocumentScrollSpace } from "../browser.utils";


export function setScrollEffect(
    xs: Observable<IncomingPayload>,
    inputs: Inputs
) {
    {
        /**
         * Group the incoming event with window, document & scrollProportionally argument
         */
        const tupleStream$ = xs.pipe(
            withLatestFrom(
                inputs.window$,
                inputs.document$,
                inputs.option$.pipe(pluck("scrollProportionally"))
            )
        );

        /**
         * Split the stream between document scrolls and element scrolls
         */
        const [document$, element$] = partition(tupleStream$, ([event]) => {
            return event.tagName === "document";
        });

        /**
         * Further split the element scroll between those matching in `scrollElementMapping`
         * and regular element scrolls
         */
        const [mapped$, nonMapped$] = partition(element$, ([event]) => {
            return event.mappingIndex > -1;
        });

        return merge(
            /**
             * Main window scroll
             */
            document$.pipe(
                tap((incoming) => {
                    const [
                        event,
                        window,
                        document,
                        scrollProportionally
                    ] = incoming;
                    const scrollSpace = getDocumentScrollSpace(document);

                    if (scrollProportionally) {
                        return window.scrollTo(
                            0,
                            scrollSpace.y * event.position.proportional
                        ); // % of y axis of scroll to px
                    }
                    return window.scrollTo(0, event.position.raw.y);
                })
            ),
            /**
             * Regular, non-mapped Element scrolls
             */
            nonMapped$.pipe(
                tap((incoming) => {
                    const [
                        event,
                        window,
                        document,
                        scrollProportionally
                    ] = incoming;

                    const matchingElements = document.getElementsByTagName(
                        event.tagName
                    );
                    if (matchingElements && matchingElements.length) {
                        const match = matchingElements[event.index];
                        if (match) {
                            return scrollElement(
                                match,
                                scrollProportionally,
                                event
                            );
                        }
                    }
                })
            ),
            /**
             * Element scrolls given in 'scrollElementMapping'
             */
            mapped$.pipe(
                withLatestFrom(
                    inputs.option$.pipe(pluck("scrollElementMapping")) as Observable<string[]>
                ),
                /**
                 * Filter the elements in the option `scrollElementMapping` so
                 * that it does not contain the element that triggered the event
                 */
                map(([incoming, scrollElementMapping]) => {
                    const [event] = incoming;
                    return [
                        incoming,
                        scrollElementMapping.filter(
                            (item, index) => index !== event.mappingIndex
                        )
                    ] as const;
                }),
                /**
                 * Now perform the scroll on all other matching elements
                 */
                tap(([incoming, scrollElementMapping]) => {
                    const [
                        event,
                        window,
                        document,
                        scrollProportionally
                    ] = incoming;
                    scrollElementMapping
                        .map(selector => document.querySelector(selector))
                        .forEach(element => {
                            scrollElement(element, scrollProportionally, event);
                        });
                })
            )
        ).pipe(ignoreElements());
    }
}

function scrollElement(element, scrollProportionally, event: IncomingPayload) {
    if (scrollProportionally && element.scrollTo) {
        return element.scrollTo(
            0,
            element.scrollHeight * event.position.proportional
        ); // % of y axis of scroll to px
    }
    return element.scrollTo(0, event.position.raw.y);
}
