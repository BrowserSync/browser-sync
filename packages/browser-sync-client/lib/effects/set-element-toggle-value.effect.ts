import { Inputs } from "../index";
import { Observable, tap, withLatestFrom } from "rxjs";
import * as FormToggleEvent from "../messages/FormToggleEvent";
import { EffectNames } from "../effects";

export function setElementToggleValueEffect(
    xs: Observable<FormToggleEvent.IncomingPayload>,
    inputs: Inputs
) {
    return xs.pipe(
        withLatestFrom(inputs.document$),
        tap(([event, document]) => {
            const elems = document.getElementsByTagName(event.tagName);
            const match = <HTMLInputElement>elems[event.index];
            if (match) {
                if (event.type === "radio") {
                    match.checked = true;
                }
                if (event.type === "checkbox") {
                    match.checked = event.checked;
                }
                if (event.tagName === "SELECT") {
                    match.value = event.value;
                }
            }
        })
    );
}

export function setElementToggleValue(event: FormToggleEvent.IncomingPayload) {
    return [EffectNames.SetElementToggleValue, event];
}
