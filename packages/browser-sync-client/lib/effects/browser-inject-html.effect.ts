import { Observable } from "rxjs/Observable";
import { Inputs } from "../index";
import { withLatestFrom } from "rxjs/operators/withLatestFrom";
import { mergeMap } from "rxjs/operators/mergeMap";
import { EffectNames } from "../effects";
import { DiffDOM } from "diff-dom";
import { consoleInfo } from "../log";
import { catchError } from "rxjs/operators/catchError";
import { of } from "rxjs/observable/of";
import { ErrorObservable } from "rxjs/observable/ErrorObservable";
import { concat } from "rxjs/observable/concat";
import { defer } from "rxjs/observable/defer";

export function browserInjectHTMLEffect(xs: Observable<any>, inputs: Inputs) {
    return xs.pipe(
        withLatestFrom(inputs.window$),
        mergeMap(([event, window]) => {
            const selectors = event.selectors.length > 0 ? event.selectors : ["head", "body"]; // defaults
            return fetchHTML(window.location.href).pipe(
                mergeMap(text => {
                    try {
                        const parser = new DOMParser();
                        const parsed = parser.parseFromString(text, "text/html");
                        // todo: pass this in the event?
                        return concat(
                            ...selectors.map(selector => {
                                return diffdomSelector(selector, document, parsed);
                            })
                        );
                    } catch (e) {
                        console.error(e);
                        return ErrorObservable.create("response was not OK");
                    }
                }),
                catchError(e => {
                    console.error(e);
                    return of(consoleInfo("[InjectHTML]: ERROR: " + e));
                })
            );
        })
    );
}

export function browserInjectHTML(event) {
    return [EffectNames.BrowserInjectHTML, event];
}

function fetchHTML(href): Observable<string> {
    return Observable.create(observer => {
        const controller = new AbortController();
        fetch(href, { credentials: "include", signal: controller.signal })
            .then(response => {
                if (response.ok) {
                    const contentType = response.headers.get("content-type");
                    if (contentType.indexOf("text/html") > -1) {
                        return response.text();
                    }
                }
                throw new Error("fetch failed");
            })
            .then(text => observer.next(text))
            .catch(e => observer.error(e));
        return () => controller.abort();
    });
}

function diffdomSelector(selector, olddoc, newdoc) {
    return defer(() => {
        const first = olddoc.querySelector(selector);
        const second = newdoc.querySelector(selector);
        if (first && second) {
            const dd = new DiffDOM({
                valueDiffing: false
            });
            const diff = dd.diff(first, second);
            dd.apply(first, diff);
            return of(consoleInfo(`[InjectHTML]: injected ${selector}`));
        }
        return ErrorObservable.create(`could not find ${selector} in both old and new`);
    });
}
