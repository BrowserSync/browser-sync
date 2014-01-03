"use strict";
// browser-sync shims
if (typeof Array.prototype.indexOf === "undefined") {
    Array.prototype.indexOf = function (searchElement, fromIndex) {
        if (!this) {
            throw new TypeError();
        }

        fromIndex = +fromIndex;
        if (isNaN(fromIndex)) {
            fromIndex = 0;
        }

        var length = this.length;

        if (length === 0 || fromIndex >= length) {
            return -1;
        }

        if (fromIndex < 0) {
            fromIndex += length;
        }

        while (fromIndex < length) {
            if (this[ fromIndex += 1] === searchElement) {
                return fromIndex;
            }
        }

        return -1;
    };
}