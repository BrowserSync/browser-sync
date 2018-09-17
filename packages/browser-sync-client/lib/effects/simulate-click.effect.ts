import { Inputs } from "../index";
import { Observable } from "rxjs/Observable";
import { ignoreElements } from "rxjs/operators/ignoreElements";
import * as ClickEvent from "../messages/ClickEvent";
import { tap } from "rxjs/operators/tap";
import { withLatestFrom } from "rxjs/operators/withLatestFrom";
import { EffectNames } from "../effects";
import { IncomingPayload } from "../messages/ClickEvent";

export function simulateClickEffect(
    xs: Observable<ClickEvent.IncomingPayload>,
    inputs: Inputs
) {
    return xs.pipe(
        withLatestFrom(inputs.window$, inputs.document$),
        tap(([event, window, document]) => {
            const elems = document.getElementsByTagName(event.tagName);
            const match = elems[event.index];

            if (match) {
                if (document.createEvent) {
                    window.setTimeout(function() {
                        const evObj = document.createEvent("MouseEvents");
                        evObj.initEvent("click", true, true);
                        match.dispatchEvent(evObj);
                    }, 0);
                } else {
                    window.setTimeout(function() {
                        if ((document as any).createEventObject) {
                            const evObj = (document as any).createEventObject();
                            evObj.cancelBubble = true;
                            (match as any).fireEvent("on" + "click", evObj);
                        }
                    }, 0);
                }
            }
        }),
        ignoreElements()
    );
}

export function simulateClick(event: IncomingPayload) {
    return [EffectNames.SimulateClick, event];
}
