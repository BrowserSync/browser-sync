import { Inputs } from "../index";
import { Observable } from "rxjs/Observable";
import * as KeyupEvent from "../messages/KeyupEvent";
import { tap } from "rxjs/operators/tap";
import { withLatestFrom } from "rxjs/operators/withLatestFrom";
import { EffectNames } from "../effects";

const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;

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
                const input = match as HTMLInputElement;
                // Call native value setter and fire a change event
                nativeInputValueSetter.call(input, event.value);
                input.dispatchEvent(new Event('change', { bubbles: true}));
            }
        })
    );
}

export function setElementValue(event: KeyupEvent.IncomingPayload) {
    return [EffectNames.SetElementValue, event];
}
