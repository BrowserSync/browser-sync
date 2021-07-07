import { EffectNames } from "../effects";
import { Inputs } from "../index";
import { Observable, tap, withLatestFrom } from "rxjs";

export function browserReload() {
    return [EffectNames.BrowserReload];
}

export function preBrowserReload() {
    return [EffectNames.PreBrowserReload];
}

export function browserReloadEffect(xs: Observable<any>, inputs: Inputs) {
    return xs.pipe(
        withLatestFrom(inputs.window$),
        tap(([, window]) => window.location.reload(true))
    );
}
