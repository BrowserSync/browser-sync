module.exports = {
    ucfirst: function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    localRootUrl: function (port, scheme) {
        return [scheme, "://", window.location.hostname, ":", port].join("");
    },
    localUrl: function(path, port, mode) {
        if (mode === "snippet") {
            return path;
        }
        return ["//", window.location.hostname, ":", port, path].join("");
    },
    orderObjectBy: function (items, field, reverse) {
        var filtered = [];
        Object.keys(items).forEach(function(key) {
            filtered.push(items[key]);
        });
        filtered.sort(function (a, b) {
            return (a[field] > b[field] ? 1 : -1);
        });
        if (reverse) {
            filtered.reverse();
        }
        return filtered;
    }
};