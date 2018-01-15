/**
 *
 * With thanks to https://github.com/livereload/livereload-js
 * :) :) :)
 *
 */
import {getLocation, pathFromUrl, pathsMatch, pickBestMatch, splitUrl, updateSearch} from "../lib/utils";

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

export interface ReloadOptions {
    stylesheetReloadTimeout?: number;
    serverURL?: string;
    overrideURL?: string;
    liveCSS?: boolean;
    liveImg?: boolean;
    tagNames: {[index: string]: string}
    attrs: {[index: string]: string}
}

export class Reloader {

    public options: any;
    public importCacheWaitPeriod: number;
    public document: Document;
    public knownToSupportCssOnLoad: boolean;
    public plugins: any[];

    constructor(public window: any, public logger, public Timer) {
        this.window = window;
        this.Timer = Timer;
        this.document = this.window.document;
        this.importCacheWaitPeriod = 200;
        this.plugins = [];
    }


    addPlugin(plugin) {
        return this.plugins.push(plugin);
    }


    analyze(callback) {
        return null;
        // return results;
    }


    reload(data, options: ReloadOptions, cb) {
        this.options = options;  // avoid passing it through all the funcs
        const {path} = data;
        if (this.options.stylesheetReloadTimeout == null) { this.options.stylesheetReloadTimeout = 15000; }

        this.plugins.forEach(plugin => {
            if (plugin.reload && plugin.reload(path, options)) {
                return;
            }
        })

        if (options.liveCSS) {
            if (path.match(/\.css$/i)) {
                this.logger.trace(`path.match(/\\.css$/i)`, true);
                if (this.reloadStylesheet(path)) {
                    return;
                }
            }
        }
        if (options.liveImg) {
            if (path.match(/\.(jpe?g|png|gif)$/i)) {
                this.logger.trace(`/\\.(jpe?g|png|gif)$/i`, true);
                this.reloadImages(path);
                return;
            }
        }

        this.logger.trace('Falling back to legacy method of replacing assets');

        /**
         * LEGACY
         */
        const domData = Reloader.getElems(data.ext, options);
        const elems   = Reloader.getMatches(domData.elems, data.basename, domData.attr);

        for (var i = 0, n = elems.length; i < n; i += 1) {
            this.swapFile(elems[i], domData, options);
        }

        (cb || function() {})(elems, domData);
    }
    public static getElems(fileExtension, options: ReloadOptions) {
        const tagName = options.tagNames[fileExtension];
        const attr    = options.attrs[tagName];
        return {
            attr,
            tagName,
            elems: document.getElementsByTagName(tagName)
        };
    }

    public static getMatches(elems, url, attr) {

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
    };

    public swapFile(elem, domData, options) {

        const attr = domData.attr;
        const currentValue = elem[attr];
        const timeStamp    = new Date().getTime();
        const key          = "browsersync-legacy";
        const suffix       = key + "=" + timeStamp;
        const anchor       = getLocation(currentValue);
        const search       = updateSearch(anchor.search, key, suffix);

        switch (domData.tagName) {
            case 'link': {
                this.logger.trace(`replacing LINK ${attr}`);
                this.reloadStylesheet(currentValue);
                break;
            }
            case 'img': {
                this.reloadImages(currentValue);
                break;
            }
            default: {
                if (options.timestamps === false) {
                    elem[attr] = anchor.href;
                } else {
                    elem[attr] = anchor.href.split("?")[0] + search;
                }

                this.logger.info(`reloading ${elem[attr]}`);

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
    };


    reloadPage() {
        return this.window.document.location.reload();
    }


    reloadImages(path) {
        const expando = this.generateUniqueString();

        [].slice.call(this.document.images).forEach(img => {
            if (pathsMatch(path, pathFromUrl(img.src))) {
                img.src = this.generateCacheBustUrl(img.src, expando);
            }
        });

        if (this.document.querySelectorAll) {
            IMAGE_STYLES.forEach(({ selector, styleNames }) => {
                [].slice.call(this.document.querySelectorAll(`[style*=${selector}]`)).forEach(img => {
                    this.reloadStyleImages(img.style, styleNames, path, expando);
                });
            });
        }

        if (this.document.styleSheets) {
            return [].slice.call(this.document.styleSheets)
                .map((styleSheet) => {
                    return this.reloadStylesheetImages(styleSheet, path, expando);
                });
        }
    }


    reloadStylesheetImages(styleSheet, path, expando) {
        let rules;
        try {
            rules = styleSheet != null ? styleSheet.cssRules : undefined;
        } catch (e) {}
        //
        if (!rules) { return; }

        [].slice.call(rules).forEach(rule => {
            switch (rule.type) {
                case CSSRule.IMPORT_RULE:
                    this.reloadStylesheetImages(rule.styleSheet, path, expando);
                    break;
                case CSSRule.STYLE_RULE:
                    [].slice.call(IMAGE_STYLES).forEach(({ styleNames }) => {
                        this.reloadStyleImages((rule as any).style, styleNames, path, expando);
                    })
                    break;
                case CSSRule.MEDIA_RULE:
                    this.reloadStylesheetImages(rule, path, expando);
                    break;
            }
        })
    }


    reloadStyleImages(style, styleNames, path, expando) {
        [].slice.call(styleNames).forEach(styleName => {
            const value = style[styleName];
            if (typeof value === 'string') {
                const newValue = value.replace(new RegExp(`\\burl\\s*\\(([^)]*)\\)`), (match, src) => {
                    if (pathsMatch(path, pathFromUrl(src))) {
                        return `url(${this.generateCacheBustUrl(src, expando)})`;
                    } else {
                        return match;
                    }
                });
                if (newValue !== value) {
                    style[styleName] = newValue;
                }
            }
        })
    }


    reloadStylesheet(path) {
        // has to be a real array, because DOMNodeList will be modified
        let link;
        const links = ((() => {
            const result = [];
            [].slice.call(this.document.getElementsByTagName('link')).forEach(link => {
                if (link.rel.match(/^stylesheet$/i) && !link.__LiveReload_pendingRemoval) {
                    result.push(link);
                }
            });
            return result;
        })());

        // find all imported stylesheets
        const imported = [];
        for (var style of Array.from(this.document.getElementsByTagName('style'))) {
            if (style.sheet) {
                this.collectImportedStylesheets(style, style.sheet, imported);
            }
        }
        for (link of Array.from(links)) {
            this.collectImportedStylesheets(link, link.sheet, imported);
        }

        // handle prefixfree
        if (this.window.StyleFix && this.document.querySelectorAll) {
            [].slice.call(this.document.querySelectorAll('style[data-href]')).forEach(style => {
                links.push(style);
            });
        }

        this.logger.debug(`found ${links.length} LINKed stylesheets, ${imported.length} @imported stylesheets`);
        const match = pickBestMatch(path, links.concat(imported), l => pathFromUrl(this.linkHref(l)));


        if (match) {
            if (match.object && match.object.rule) {
                this.logger.info(`reloading imported stylesheet: ${match.object.href}`);
                this.reattachImportedRule(match.object);
            } else {
                this.logger.info(`reloading stylesheet: ${this.linkHref(match.object)}`);
                this.reattachStylesheetLink(match.object);
            }
        } else {
            this.logger.info(`reloading all stylesheets because path '${path}' did not match any specific one`);
            links.forEach(link => this.reattachStylesheetLink(link));
        }
        return true;
    }


    collectImportedStylesheets(link, styleSheet, result) {
        // in WebKit, styleSheet.cssRules is null for inaccessible stylesheets;
        // Firefox/Opera may throw exceptions
        let rules;
        try {
            rules = styleSheet != null ? styleSheet.cssRules : undefined;
        } catch (e) {}
        //
        if (rules && rules.length) {
            for (let index = 0; index < rules.length; index++) {
                const rule = rules[index];
                switch (rule.type) {
                    case CSSRule.CHARSET_RULE:
                        break;
                    case CSSRule.IMPORT_RULE:
                        result.push({ link, rule, index, href: rule.href });
                        this.collectImportedStylesheets(link, rule.styleSheet, result);
                        break;
                    default:
                        break;  // import rules can only be preceded by charset rules
                }
            }
        }
    }


    waitUntilCssLoads(clone, func) {
        let callbackExecuted = false;

        const executeCallback = () => {
            if (callbackExecuted) { return; }
            callbackExecuted = true;
            return func();
        };

        // supported by Chrome 19+, Safari 5.2+, Firefox 9+, Opera 9+, IE6+
        // http://www.zachleat.com/web/load-css-dynamically/
        // http://pieisgood.org/test/script-link-events/
        clone.onload = () => {
            this.logger.debug("the new stylesheet has finished loading");
            this.knownToSupportCssOnLoad = true;
            return executeCallback();
        };

        if (!this.knownToSupportCssOnLoad) {
            // polling
            let poll;
            (poll = () => {
                if (clone.sheet) {
                    this.logger.debug("polling until the new CSS finishes loading...");
                    return executeCallback();
                } else {
                    return this.Timer.start(50, poll);
                }
            })();
        }

        // fail safe
        return this.Timer.start(this.options.stylesheetReloadTimeout, executeCallback);
    }


    linkHref(link) {
        // prefixfree uses data-href when it turns LINK into STYLE
        return link.href || link.getAttribute('data-href');
    }


    reattachStylesheetLink(link) {
        // ignore LINKs that will be removed by LR soon
        let clone;
        if (link.__LiveReload_pendingRemoval) { return; }
        link.__LiveReload_pendingRemoval = true;

        if (link.tagName === 'STYLE') {
            // prefixfree
            clone = this.document.createElement('link');
            clone.rel      = 'stylesheet';
            clone.media    = link.media;
            clone.disabled = link.disabled;
        } else {
            clone = link.cloneNode(false);
        }

        clone.href = this.generateCacheBustUrl(this.linkHref(link));

        // insert the new LINK before the old one
        const parent = link.parentNode;
        if (parent.lastChild === link) {
            parent.appendChild(clone);
        } else {
            parent.insertBefore(clone, link.nextSibling);
        }

        return this.waitUntilCssLoads(clone, () => {
            let additionalWaitingTime;
            if (/AppleWebKit/.test(navigator.userAgent)) {
                additionalWaitingTime = 5;
            } else {
                additionalWaitingTime = 200;
            }

            return this.Timer.start(additionalWaitingTime, () => {
                if (!link.parentNode) { return; }
                link.parentNode.removeChild(link);
                clone.onreadystatechange = null;

                return (this.window.StyleFix != null ? this.window.StyleFix.link(clone) : undefined);
            });
        }); // prefixfree
    }


    reattachImportedRule({ rule, index, link }) {
        const parent  = rule.parentStyleSheet;
        const href    = this.generateCacheBustUrl(rule.href);
        const media   = rule.media.length ? [].join.call(rule.media, ', ') : '';
        const newRule = `@import url("${href}") ${media};`;

        // used to detect if reattachImportedRule has been called again on the same rule
        rule.__LiveReload_newHref = href;

        // WORKAROUND FOR WEBKIT BUG: WebKit resets all styles if we add @import'ed
        // stylesheet that hasn't been cached yet. Workaround is to pre-cache the
        // stylesheet by temporarily adding it as a LINK tag.
        const tempLink = this.document.createElement("link");
        tempLink.rel = 'stylesheet';
        tempLink.href = href;
        tempLink.__LiveReload_pendingRemoval = true;  // exclude from path matching
        if (link.parentNode) {
            link.parentNode.insertBefore(tempLink, link);
        }

        // wait for it to load
        return this.Timer.start(this.importCacheWaitPeriod, () => {
            if (tempLink.parentNode) { tempLink.parentNode.removeChild(tempLink); }

            // if another reattachImportedRule call is in progress, abandon this one
            if (rule.__LiveReload_newHref !== href) { return; }

            parent.insertRule(newRule, index);
            parent.deleteRule(index+1);

            // save the new rule, so that we can detect another reattachImportedRule call
            rule = parent.cssRules[index];
            rule.__LiveReload_newHref = href;

            // repeat again for good measure
            return this.Timer.start(this.importCacheWaitPeriod, () => {
                // if another reattachImportedRule call is in progress, abandon this one
                if (rule.__LiveReload_newHref !== href) { return; }

                parent.insertRule(newRule, index);
                return parent.deleteRule(index+1);
            });
        });
    }


    generateUniqueString() {
        return `browsersync=${Date.now()}`;
    }


    generateCacheBustUrl(url, expando = this.generateUniqueString()) {
        let hash, oldParams;

        ({ url, hash, params: oldParams } = splitUrl(url));

        if (this.options.overrideURL) {
            if (url.indexOf(this.options.serverURL) < 0) {
                const originalUrl = url;
                url = this.options.serverURL + this.options.overrideURL + "?url=" + encodeURIComponent(url);
                this.logger.debug(`overriding source URL ${originalUrl} with ${url}`);
            }
        }

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
}
