/**
 *
 * With thanks to https://github.com/livereload/livereload-js
 * :) :) :)
 *
 */
import {getLocation, pathFromUrl, pathsMatch, pickBestMatch, splitUrl, updateSearch, array} from "../lib/utils";
import {empty} from "rxjs/observable/empty";
import {Observable} from "rxjs/Observable";
import {merge} from "rxjs/observable/merge";
import {timer} from "rxjs/observable/timer";
import {from} from "rxjs/observable/from";
import {filter} from "rxjs/operators/filter";
import {map} from "rxjs/operators/map";
import {mergeMap} from "rxjs/operators/mergeMap";
import {tap} from "rxjs/operators/tap";
import {mapTo} from "rxjs/operators/mapTo";
import {propSet} from "../lib/dom-effects/prop-set.dom-effect";
import {styleSet} from "../lib/dom-effects/style-set.dom-effect";
import {linkReplace} from "../lib/dom-effects/link-replace.dom-effect";
import {mergeAll} from "rxjs/operators/mergeAll";

var hiddenElem;

declare global {
    interface HTMLLinkElement {
        __LiveReload_pendingRemoval: boolean
    }
}

const IMAGE_STYLES = [
    { selector: 'background', styleNames: ['backgroundImage'] },
    { selector: 'border', styleNames: ['borderImage', 'webkitBorderImage', 'MozBorderImage'] }
];

const attrs = {
    link: "href",
    img: "src",
    script: "src"
};

export interface ReloadOptions {
    stylesheetReloadTimeout?: number;
    serverURL?: string;
    overrideURL?: string;
    liveCSS?: boolean;
    liveImg?: boolean;
    tagNames: {[index: string]: string}
}

export function reload(document: Document, navigator: Navigator) {
    return function(data, options: ReloadOptions): Observable<any> {
        const {path} = data;

        if (options.liveCSS) {
            if (path.match(/\.css$/i)) {
                return reloadStylesheet(path, document, navigator);
            }
        }

        if (options.liveImg) {
            if (path.match(/\.(jpe?g|png|gif)$/i)) {
                return reloadImages(path, document);
            }
        }

        /**
         * LEGACY
         */
        const domData = getElems(data.ext, options, document);
        const elems   = getMatches(domData.elems, data.basename, domData.attr);

        for (var i = 0, n = elems.length; i < n; i += 1) {
            swapFile(elems[i], domData, options, document, navigator);
        }

        return empty();
    }

    function getMatches(elems, url, attr) {

        if (url[0] === "*") {
            return elems;
        }

        var matches = [];
        var urlMatcher = new RegExp("(^|/)" + url);

        for (var i = 0, len = elems.length; i < len; i += 1) {
            if (urlMatcher.test(elems[i][attr])) {
                matches.push(elems[i]);
            }
        }

        return matches;
    }

    function getElems(fileExtension, options: ReloadOptions, document: Document) {
        const tagName = options.tagNames[fileExtension];
        const attr    = attrs[tagName];
        return {
            attr,
            tagName,
            elems: document.getElementsByTagName(tagName)
        };
    }


    function reloadImages(path, document): Observable<any> {

        const expando = generateUniqueString(Date.now());

        return merge(
            from([].slice.call(document.images))
                .pipe(
                    filter((img: HTMLImageElement) => pathsMatch(path, pathFromUrl(img.src)))
                    , map((img: HTMLImageElement) => {
                        const payload = {
                            target: img,
                            prop: 'src',
                            value: generateCacheBustUrl(img.src, expando),
                            pathname: getLocation(img.src).pathname
                        };
                        return propSet(payload);
                    })
                ),
            from(IMAGE_STYLES)
                .pipe(
                    mergeMap(({ selector, styleNames }) => {
                        return from(document.querySelectorAll(`[style*=${selector}]`)).pipe(
                            mergeMap((img: HTMLImageElement) => {
                                return reloadStyleImages(img.style, styleNames, path, expando);
                            })
                        )

                    })
                )
        );

        // if (document.styleSheets) {
        //     return [].slice.call(document.styleSheets)
        //         .map((styleSheet) => {
        //             return reloadStylesheetImages(styleSheet, path, expando);
        //         });
        // }
    }


    function reloadStylesheetImages(styleSheet, path, expando) {
        let rules;
        try {
            rules = styleSheet != null ? styleSheet.cssRules : undefined;
        } catch (e) {}
        //
        if (!rules) { return; }

        [].slice.call(rules).forEach(rule => {
            switch (rule.type) {
                case CSSRule.IMPORT_RULE:
                    reloadStylesheetImages(rule.styleSheet, path, expando);
                    break;
                case CSSRule.STYLE_RULE:
                    [].slice.call(IMAGE_STYLES).forEach(({ styleNames }) => {
                        reloadStyleImages((rule as any).style, styleNames, path, expando);
                    })
                    break;
                case CSSRule.MEDIA_RULE:
                    reloadStylesheetImages(rule, path, expando);
                    break;
            }
        })
    }

    function reloadStyleImages(style, styleNames: string[], path, expando): Observable<any> {
        return from(styleNames).pipe(
            filter(styleName => typeof style[styleName] === 'string')
            , map((styleName: string) => {
                let pathName;
                const value = style[styleName];
                const newValue = value.replace(new RegExp(`\\burl\\s*\\(([^)]*)\\)`), (match, src) => {
                    let _src = src;
                    if (src[0] === '"' && src[src.length-1] === '"') {
                        _src = src.slice(1, -1);
                    }
                    pathName = getLocation(_src).pathname;
                    if (pathsMatch(path, pathFromUrl(_src))) {
                        return `url(${generateCacheBustUrl(_src, expando)})`;
                    } else {
                        return match;
                    }
                });

                return [
                    style,
                    styleName,
                    value,
                    newValue,
                    pathName
                ];
            })
            , filter(([style, styleName, value, newValue]) => newValue !== value)
            , map(([style, styleName, value, newValue, pathName]) => styleSet({style, styleName, value, newValue, pathName}))
        )
    }

    function swapFile(elem, domData, options, document, navigator) {

        const attr = domData.attr;
        const currentValue = elem[attr];
        const timeStamp    = new Date().getTime();
        const key          = "browsersync-legacy";
        const suffix       = key + "=" + timeStamp;
        const anchor       = getLocation(currentValue);
        const search       = updateSearch(anchor.search, key, suffix);

        switch (domData.tagName) {
            case 'link': {
                // this.logger.trace(`replacing LINK ${attr}`);
                reloadStylesheet(currentValue, document, navigator);
                break;
            }
            case 'img': {
                reloadImages(currentValue, document);
                break;
            }
            default: {
                if (options.timestamps === false) {
                    elem[attr] = anchor.href;
                } else {
                    elem[attr] = anchor.href.split("?")[0] + search;
                }

                // this.logger.info(`reloading ${elem[attr]}`);

                setTimeout(function () {
                    if (!hiddenElem) {
                        hiddenElem = document.createElement("DIV");
                        document.body.appendChild(hiddenElem);
                    } else {
                        hiddenElem.style.display = "none";
                        hiddenElem.style.display = "block";
                    }
                }, 200);
            }
        }

        return {
            elem: elem,
            timeStamp: timeStamp
        };
    }

    function reattachStylesheetLink(link: HTMLLinkElement, document: Document, navigator: Navigator): Observable<any> {
        // ignore LINKs that will be removed by LR soon
        let clone;

        if (link.__LiveReload_pendingRemoval) {
            return empty();
        }
        link.__LiveReload_pendingRemoval = true;

        if (link.tagName === 'STYLE') {
            // prefixfree
            clone = document.createElement('link');
            clone.rel      = 'stylesheet';
            clone.media    = link.media;
            clone.disabled = link.disabled;
        } else {
            clone = link.cloneNode(false);
        }

        const prevHref = link.href;
        const nextHref = generateCacheBustUrl(linkHref(link));
        clone.href = nextHref;

        const {pathname} = getLocation(nextHref);
        const basename = pathname.split('/').slice(-1)[0];

        // insert the new LINK before the old one
        const parent = link.parentNode;
        if (parent.lastChild === link) {
            parent.appendChild(clone);
        } else {
            parent.insertBefore(clone, link.nextSibling);
        }

        let additionalWaitingTime;
        if (/AppleWebKit/.test(navigator.userAgent)) {
            additionalWaitingTime = 5;
        } else {
            additionalWaitingTime = 200;
        }

        return Observable.create(obs => {
            clone.onload = () => {
                obs.next(true);
                obs.complete()
            };
        })
            .pipe(
                mergeMap(() => {
                    return timer(additionalWaitingTime)
                        .pipe(
                            tap(() => {
                                if (link && !link.parentNode) {
                                    return;
                                }
                                link.parentNode.removeChild(link);
                                clone.onreadystatechange = null;
                            })
                            , mapTo(linkReplace({target: clone, nextHref, prevHref, pathname, basename}))
                        )
                })
            )
    }

    function reattachImportedRule({ rule, index, link }, document: Document): Observable<any> {
        const parent  = rule.parentStyleSheet;
        const href    = generateCacheBustUrl(rule.href);
        const media   = rule.media.length ? [].join.call(rule.media, ', ') : '';
        const newRule = `@import url("${href}") ${media};`;

        // used to detect if reattachImportedRule has been called again on the same rule
        rule.__LiveReload_newHref = href;

        // WORKAROUND FOR WEBKIT BUG: WebKit resets all styles if we add @import'ed
        // stylesheet that hasn't been cached yet. Workaround is to pre-cache the
        // stylesheet by temporarily adding it as a LINK tag.
        const tempLink = document.createElement("link");
        tempLink.rel = 'stylesheet';
        tempLink.href = href;
        tempLink.__LiveReload_pendingRemoval = true;  // exclude from path matching

        if (link.parentNode) {
            link.parentNode.insertBefore(tempLink, link);
        }

        return timer(200)
            .pipe(
                tap(() => {
                    if (tempLink.parentNode) { tempLink.parentNode.removeChild(tempLink); }

                    // if another reattachImportedRule call is in progress, abandon this one
                    if (rule.__LiveReload_newHref !== href) { return; }

                    parent.insertRule(newRule, index);
                    parent.deleteRule(index+1);

                    // save the new rule, so that we can detect another reattachImportedRule call
                    rule = parent.cssRules[index];
                    rule.__LiveReload_newHref = href;
                })
                , mergeMap(() => {
                    return timer(200).pipe(
                        tap(() => {
                            // if another reattachImportedRule call is in progress, abandon this one
                            if (rule.__LiveReload_newHref !== href) { return; }
                            parent.insertRule(newRule, index);
                            return parent.deleteRule(index+1);
                        })
                    )
                })
            );
    }

    function generateCacheBustUrl(url, expando = generateUniqueString(Date.now())) {
        let hash, oldParams;

        ({ url, hash, params: oldParams } = splitUrl(url));

        // if (this.options.overrideURL) {
        //     if (url.indexOf(this.options.serverURL) < 0) {
        //         const originalUrl = url;
        //         url = this.options.serverURL + this.options.overrideURL + "?url=" + encodeURIComponent(url);
        //         this.logger.debug(`overriding source URL ${originalUrl} with ${url}`);
        //     }
        // }

        let params = oldParams.replace(/(\?|&)browsersync=(\d+)/, (match, sep) => `${sep}${expando}`);
        if (params === oldParams) {
            if (oldParams.length === 0) {
                params = `?${expando}`;
            } else {
                params = `${oldParams}&${expando}`;
            }
        }

        return url + params + hash;
    }


    function reloadStylesheet(path: string, document: Document, navigator): Observable<any> {
        // has to be a real array, because DOMNodeList will be modified
        const links: HTMLLinkElement[] = array(document.getElementsByTagName('link'))
            .filter(link => {
                return link.rel.match(/^stylesheet$/i)
                    && !link.__LiveReload_pendingRemoval;
            });

        /**
         * Find imported style sheets in <style> tags
         * @type {any[]}
         */
        const styleImported = array(document.getElementsByTagName('style'))
            .filter(style => Boolean(style.sheet))
            .reduce((acc, style) => {
                return acc.concat(collectImportedStylesheets(style, style.sheet));
            }, []);

        /**
         * Find imported style sheets in <link> tags
         * @type {any[]}
         */
        const linksImported = links
            .reduce((acc, link) => {
                return acc.concat(collectImportedStylesheets(link, link.sheet));
            }, []);

        /**
         * Combine all links + sheets
         */
        const allRules = links.concat(styleImported, linksImported);

        /**
         * Which href best matches the incoming href?
         */
        const match = pickBestMatch(path, allRules, l => pathFromUrl(linkHref(l)));

        if (match) {
            if (match.object && match.object.rule) {
                return reattachImportedRule(match.object, document);
            }
            return reattachStylesheetLink(match.object, document, navigator);
        } else {
            if (links.length) {
                // no <link> elements matched, so was the path including '*'?
                const [first, ...rest] = path.split('.');
                if (first === '*') {
                    return from(links.map(link => reattachStylesheetLink(link, document, navigator)))
                        .pipe(mergeAll())
                }
            }
        }

        return empty();
    }


    function collectImportedStylesheets(link, styleSheet) {
        // in WebKit, styleSheet.cssRules is null for inaccessible stylesheets;
        // Firefox/Opera may throw exceptions
        const output = [];
        collect(link, makeRules(styleSheet));
        return output;

        function makeRules(styleSheet) {
            let rules;
            try {
                rules = styleSheet != null ? styleSheet.cssRules : undefined;
            } catch (e) {}
            return rules;
        }
        function collect(link, rules) {
            if (rules && rules.length) {
                for (let index = 0; index < rules.length; index++) {
                    const rule = rules[index];
                    switch (rule.type) {
                        case CSSRule.CHARSET_RULE:
                            break;
                        case CSSRule.IMPORT_RULE:
                            output.push({ link, rule, index, href: rule.href });
                            collect(link, makeRules(rule.styleSheet));
                            break;
                        default:
                            break;  // import rules can only be preceded by charset rules
                    }
                }
            }
        }
    }

    function linkHref(link) {
        // prefixfree uses data-href when it turns LINK into STYLE
        return link.href || link.getAttribute('data-href');
    }

    function generateUniqueString(value) {
        return `browsersync=${value}`;
    }
}

