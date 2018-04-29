import { FileReloadEventPayload } from "../../types/socket";
import { EffectNames } from "../effects";
import { Inputs } from "../index";
import { reload } from "../../vendor/Reloader";
import { withLatestFrom } from "rxjs/operators/withLatestFrom";
import { mergeMap } from "rxjs/operators/mergeMap";
import { Observable } from "rxjs/Observable";

export function fileReload(event: FileReloadEventPayload) {
    return [EffectNames.FileReload, event];
}

/**
 * Attempt to reload files in place
 * @param xs
 * @param inputs
 */
export function fileReloadEffect(
    xs: Observable<FileReloadEventPayload>,
    inputs: Inputs
) {
    return xs.pipe(
        withLatestFrom(inputs.option$, inputs.document$, inputs.navigator$),
        mergeMap(([event, options, document, navigator]) => {
            return reload(document, navigator)(event, {
                tagNames: options.tagNames,
                liveCSS: true,
                liveImg: true
            });
        })
    );
}
