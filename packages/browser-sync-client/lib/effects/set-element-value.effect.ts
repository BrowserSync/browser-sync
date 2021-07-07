import { Inputs } from "../index";
import { Observable, tap, withLatestFrom } from "rxjs";
import * as KeyupEvent from "../messages/KeyupEvent";
import { EffectNames } from "../effects";

export function setElementValueEffect(
    xs: Observable<KeyupEvent.IncomingPayload>,
    inputs: Inputs
) {
    return xs.pipe(
        withLatestFrom(inputs.document$),
        tap(([event, document]) => {
            const elems = document.getElementsByTagName(event.tagName);
            const match = elems[event.index];
            if (match) {
                (match as HTMLInputElement).value = event.value;
            }
        })
    );
}

export function setElementValue(event: KeyupEvent.IncomingPayload) {
    return [EffectNames.SetElementValue, event];
}
