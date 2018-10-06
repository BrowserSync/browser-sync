import { concat } from "rxjs/observable/concat";
import { timer } from "rxjs/observable/timer";
import { of } from "rxjs/observable/of";
import { switchMap } from "rxjs/operators/switchMap";
import { startWith } from "rxjs/operators/startWith";
import { mapTo } from "rxjs/operators/mapTo";

export function each(incoming) {
    return [].slice.call(incoming || []);
}

export const splitUrl = function(url) {
    let hash, index, params;
    if ((index = url.indexOf("#")) >= 0) {
        hash = url.slice(index);
        url = url.slice(0, index);
    } else {
        hash = "";
    }

    if ((index = url.indexOf("?")) >= 0) {
        params = url.slice(index);
        url = url.slice(0, index);
    } else {
        params = "";
    }

    return { url, params, hash };
};

export const pathFromUrl = function(url) {
    let path;
    ({ url } = splitUrl(url));
    if (url.indexOf("file://") === 0) {
        path = url.replace(new RegExp(`^file://(localhost)?`), "");
    } else {
        //                        http  :   // hostname  :8080  /
        path = url.replace(new RegExp(`^([^:]+:)?//([^:/]+)(:\\d*)?/`), "/");
    }

    // decodeURI has special handling of stuff like semicolons, so use decodeURIComponent
    return decodeURIComponent(path);
};

export const pickBestMatch = function(path, objects, pathFunc): any {
    let score;
    let bestMatch = { score: 0, object: null };

    objects.forEach(object => {
        score = numberOfMatchingSegments(path, pathFunc(object));
        if (score > bestMatch.score) {
            bestMatch = { object, score };
        }
    });

    if (bestMatch.score > 0) {
        return bestMatch;
    } else {
        return null;
    }
};

export const numberOfMatchingSegments = function(path1, path2) {
    path1 = normalisePath(path1);
    path2 = normalisePath(path2);

    if (path1 === path2) {
        return 10000;
    }

    const comps1 = path1.split("/").reverse();
    const comps2 = path2.split("/").reverse();
    const len = Math.min(comps1.length, comps2.length);

    let eqCount = 0;
    while (eqCount < len && comps1[eqCount] === comps2[eqCount]) {
        ++eqCount;
    }

    return eqCount;
};

export const pathsMatch = (path1, path2) =>
    numberOfMatchingSegments(path1, path2) > 0;

export function getLocation(url: string) {
    var location = document.createElement("a");
    location.href = url;

    if (location.host === "") {
        location.href = location.href;
    }

    return location;
}

/**
 * @param {string} search
 * @param {string} key
 * @param {string} suffix
 */
export function updateSearch(search, key, suffix) {
    if (search === "") {
        return "?" + suffix;
    }

    return (
        "?" +
        search
            .slice(1)
            .split("&")
            .map(function(item) {
                return item.split("=");
            })
            .filter(function(tuple) {
                return tuple[0] !== key;
            })
            .map(function(item) {
                return [item[0], item[1]].join("=");
            })
            .concat(suffix)
            .join("&")
    );
}

const blacklist = [
    // never allow .map files through
    function(incoming) {
        return incoming.ext === "map";
    }
];

/**
 * @param incoming
 * @returns {boolean}
 */
export function isBlacklisted(incoming) {
    return blacklist.some(function(fn) {
        return fn(incoming);
    });
}

export function createTimedBooleanSwitch(source$, timeout = 1000) {
    return source$.pipe(
        switchMap(() => {
            return concat(of(false), timer(timeout).pipe(mapTo(true)));
        }),
        startWith(true)
    );
}

export function array(incoming) {
    return [].slice.call(incoming);
}

export function normalisePath(path: string): string {
    return path
        .replace(/^\/+/, "")
        .replace(/\\/g, "/")
        .toLowerCase();
}
