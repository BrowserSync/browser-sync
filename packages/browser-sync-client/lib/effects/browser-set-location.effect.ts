import { Inputs } from "../index";
import { ignoreElements, Observable, tap, withLatestFrom } from "rxjs";
import { IncomingPayload } from "../messages/BrowserLocation";
import { EffectNames } from "../effects";

export function browserSetLocationEffect(
    xs: Observable<IncomingPayload>,
    inputs: Inputs
) {
    return xs.pipe(
        withLatestFrom(inputs.window$),
        tap(([event, window]) => {
            if (event.path) {
                return ((window.location as any) =
                    window.location.protocol +
                    "//" +
                    window.location.host +
                    event.path);
            }
            if (event.url) {
                return ((window.location as any) = event.url);
            }
        }),
        ignoreElements()
    );
}

export function browserSetLocation(input: IncomingPayload) {
    return [EffectNames.BrowserSetLocation, input];
}
