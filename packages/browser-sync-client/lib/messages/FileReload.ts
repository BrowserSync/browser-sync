import { Inputs } from "../index";
import { filter } from "rxjs/operators/filter";
import { empty } from "rxjs/observable/empty";
import { isBlacklisted } from "../utils";
import { FileReloadEventPayload } from "../../types/socket";
import { of } from "rxjs/observable/of";
import { Observable } from "rxjs/Observable";
import { withLatestFrom } from "rxjs/operators/withLatestFrom";
import { mergeMap } from "rxjs/operators/mergeMap";
import { fileReload } from "../effects/file-reload.effect";
import { reloadBrowserSafe } from "./BrowserReload";

export function incomingFileReload(
    xs: Observable<FileReloadEventPayload>,
    inputs: Inputs
) {
    return xs.pipe(
        withLatestFrom(inputs.option$),
        filter(([event, options]) => options.codeSync),
        mergeMap(([event, options]) => {
            if (event.url || !options.injectChanges) {
                return reloadBrowserSafe();
            }
            if (event.basename && event.ext && isBlacklisted(event)) {
                return empty();
            }
            return of(fileReload(event));
        })
    );
}
