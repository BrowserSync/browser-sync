import { Inputs } from "../index";
import { EMPTY, filter, mergeMap, Observable, of, withLatestFrom } from "rxjs";
import { isBlacklisted } from "../utils";
import { FileReloadEventPayload } from "../../types/socket";
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
                return EMPTY;
            }
            return of(fileReload(event));
        })
    );
}
