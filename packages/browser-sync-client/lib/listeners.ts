import { merge } from "rxjs/observable/merge";
import { getFormInputStream } from "./listeners/form-inputs.listener";
import { getClickStream } from "./listeners/clicks.listener";
import { getScrollStream } from "./listeners/scroll.listener";
import { getFormTogglesStream } from "./listeners/form-toggles.listener";
import { OutgoingSocketEvent } from "./socket-messages";
import { Observable } from "rxjs/Observable";
import { Inputs } from "./index";

export function initListeners(
    window: Window,
    document: Document,
    socket$: Inputs["socket$"],
    option$: Inputs["option$"]
): Observable<OutgoingSocketEvent> {
    const merged$ = merge(
        getScrollStream(window, document, socket$, option$),
        getClickStream(document, socket$, option$),
        getFormInputStream(document, socket$, option$),
        getFormTogglesStream(document, socket$, option$)
    );

    return merged$;
}
