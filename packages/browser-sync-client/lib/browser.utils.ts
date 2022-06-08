/**
 * @returns {window}
 */
import * as ScrollEvent from "./messages/ScrollEvent";
import ICoords = ScrollEvent.ICoords;

export function getWindow() {
    return window;
}

/**
 * @returns {HTMLDocument}
 */
export function getDocument() {
    return document;
}

/**
 * Get the current x/y position crossbow
 * @returns {{x: *, y: *}}
 */
export function getBrowserScrollPosition(window, document): ICoords {
    let scrollX;
    let scrollY;
    const dElement = document.documentElement;
    const dBody = document.body;

    if (window.pageYOffset !== undefined) {
        scrollX = window.pageXOffset;
        scrollY = window.pageYOffset;
    } else {
        scrollX = dElement.scrollLeft || dBody.scrollLeft || 0;
        scrollY = dElement.scrollTop || dBody.scrollTop || 0;
    }

    return {
        x: scrollX,
        y: scrollY
    };
}

/**
 * @returns {{x: number, y: number}}
 */
export function getDocumentScrollSpace(
    document: Document
): ScrollEvent.ICoords {
    const dElement = document.documentElement;
    const dBody = document.body;
    return {
        x: dBody.scrollHeight - dElement.clientWidth,
        y: dBody.scrollHeight - dElement.clientHeight
    };
}

/**
 * Saves scroll position into cookies
 */
export function saveScrollPosition(window, document) {
    const pos = getBrowserScrollPosition(window, document);
    document.cookie = "bs_scroll_pos=" + [pos.x, pos.y].join(",");
}

/**
 * Restores scroll position from cookies
 */
export function restoreScrollPosition() {
    const pos = getDocument()
        .cookie.replace(
            /(?:(?:^|.*;\s*)bs_scroll_pos\s*\=\s*([^;]*).*$)|^.*$/,
            "$1"
        )
        .split(",");
    getWindow().scrollTo(Number(pos[0]), Number(pos[1]));
}

/**
 * @param tagName
 * @param elem
 * @returns {*|number}
 */
export function getElementIndex(tagName, elem) {
    var allElems = getDocument().getElementsByTagName(tagName);
    return Array.prototype.indexOf.call(allElems, elem);
}

/**
 * Force Change event on radio & checkboxes (IE)
 */
export function forceChange(elem) {
    elem.blur();
    elem.focus();
}

/**
 * @param elem
 * @returns {{tagName: (elem.tagName|*), index: *}}
 */
export function getElementData(elem) {
    var tagName = elem.tagName;
    var index = getElementIndex(tagName, elem);
    return {
        tagName: tagName,
        index: index
    };
}

/**
 * @param {string} tagName
 * @param {number} index
 */
export function getSingleElement(tagName, index) {
    var elems = getDocument().getElementsByTagName(tagName);
    return elems[index];
}

/**
 * Get the body element
 */
export function getBody() {
    return getDocument().getElementsByTagName("body")[0];
}

/**
 * @param {{x: number, y: number}} pos
 */
export function setScroll(pos) {
    getWindow().scrollTo(pos.x, pos.y);
}

/**
 * Hard reload
 */
export function reloadBrowser() {
    getWindow().location.reload();
}

/**
 * Foreach polyfill
 * @param coll
 * @param fn
 */
export function forEach(coll, fn) {
    for (var i = 0, n = coll.length; i < n; i += 1) {
        fn(coll[i], i, coll);
    }
}

/**
 * Are we dealing with old IE?
 * @returns {boolean}
 */
export function isOldIe() {
  // @ts-ignore - Only IE < 11 has .attachEvent property
  // https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/aa703974(v=vs.85)
    return typeof getWindow().attachEvent !== "undefined";
}

/**
 * Split the URL information
 * @returns {object}
 */
export function getLocation(url) {
    const location = getDocument().createElement("a");
    location.href = url;

    if (location.host === "") {
        location.href = location.href;
    }

    return location;
}

/**
 * @param {String} val
 * @returns {boolean}
 */
export function isUndefined(val) {
    return "undefined" === typeof val;
}

/**
 * @param obj
 * @param path
 */
export function getByPath(obj, path) {
    for (
        var i = 0, tempPath = path.split("."), len = tempPath.length;
        i < len;
        i++
    ) {
        if (!obj || typeof obj !== "object") {
            return false;
        }
        obj = obj[tempPath[i]];
    }

    if (typeof obj === "undefined") {
        return false;
    }

    return obj;
}

export function getScrollPosition(
    window: Window,
    document: Document
): ScrollEvent.Data {
    const pos = getBrowserScrollPosition(window, document);
    return {
        raw: pos, // Get px of x and y axis of scroll
        proportional: getScrollTopPercentage(pos, document) // Get % of y axis of scroll
    };
}

export function getScrollPositionForElement(
    element: HTMLElement
): ScrollEvent.Data {
    const raw: ICoords = {
        x: element.scrollLeft,
        y: element.scrollTop
    };
    const scrollSpace: ICoords = {
        x: element.scrollWidth,
        y: element.scrollHeight
    };
    return {
        raw, // Get px of x and y axis of scroll
        proportional: getScrollPercentage(scrollSpace, raw).y // Get % of y axis of scroll
    };
}

export function getScrollTopPercentage(pos, document): number {
    const scrollSpace = getDocumentScrollSpace(document);
    const percentage = getScrollPercentage(scrollSpace, pos);
    return percentage.y;
}

export function getScrollPercentage(
    scrollSpace: ICoords,
    scrollPosition: ICoords
): ICoords {
    const x = scrollPosition.x / scrollSpace.x;
    const y = scrollPosition.y / scrollSpace.y;

    return {
        x: x || 0,
        y: y
    };
}
