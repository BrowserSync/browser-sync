var Immutable    = require("immutable");
var qs           = require("qs");

function resolvePlugin(item) {

    if (typeof item === "string") {
        return getFromString(item);
    }

    if (Immutable.Map.isMap(item)) {

        if (item.has("module")) {

            var nameOrObj = item.get("module");
            var options = item.get("options");

            if (options) {
                options = options.toJS();
            } else {
                options = {}
            }

            if (typeof nameOrObj === "string") {
                var plugin = getFromString(nameOrObj);
                plugin.options = options;
                return plugin;
            }

            if (Immutable.Map.isMap(nameOrObj)) {
                return {
                    module: nameOrObj.toJS(),
                    options: options
                }
            }
        }
        if (item.has("plugin")) {
            // top level plugin
            var mod = item.toJS();
            return {
                module: mod,
                options: {}
            }
        }
    }
    return {
        name: item,
        options: {}
    }
}

module.exports.resolvePlugin = resolvePlugin;

function requirePlugin (item) {
    if (!item.module) {
        try {
            item.module = require(item.name);
        } catch (e) {
            if (e.code === "MODULE_NOT_FOUND") {
                item.errors = [e];
            } else {
                throw e;
            }
        }
    }
    return item;
}
module.exports.requirePlugin = requirePlugin;

function getFromString(string) {
    var split = string.split("?");
    if (split.length > 1) {
        return {
            moduleName: split[0],
            name: split[0],
            options: qs.parse(split[1])
        }
    }
    return {
        moduleName: split[0],
        name: split[0],
        options: {}
    };
}

