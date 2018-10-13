import {BsTempOptions} from "./cli/cli-options";

import * as devIp from "dev-ip";
import * as portScanner from "portscanner";
import * as path from "path";
import * as UAParser from "ua-parser-js";
import * as Immutable from "immutable";
import {List} from "immutable";

const _ = require("./lodash.custom");
const parser = new UAParser();

/**
 * @param {Object} options
 * @returns {String|boolean} - the IP address
 * @param devIp
 */
export function getHostIp(options: BsTempOptions, devIp: string[]) {
    if (options) {
        var host = options.get("host");
        if (host && host !== "localhost") {
            return host;
        }
        if (options.get("detect") === false || !devIp.length) {
            return false;
        }
    }

    return devIp.length ? devIp[0] : false;
}

/**
 * Set URL Options
 */
export function getUrlOptions(options: BsTempOptions): Map<string, string> {
    const scheme = options.get("scheme");

    const port = options.get("port");
    const urls: { [index: string]: string } = {};
    const listen = options.get("listen");

    if (options.get("online") === false || listen) {
        const host = listen || "localhost";
        urls.local = getUrl(`${scheme}://${host}:${port}`, options);
        return Immutable.fromJS(urls);
    }

    const fn: typeof getHostIp = exports.getHostIp;
    const external = xip(fn(options, devIp()), options);
    let localhost = "localhost";

    if (options.get("xip")) {
        localhost = "127.0.0.1";
    }

    localhost = xip(localhost, options);

    return Immutable.fromJS(
        getUrls(external, localhost, scheme, options)
    );
}

/**
 * Append a start path if given in options
 * @param {String} url
 * @param {Object} options
 * @returns {String}
 */
export function getUrl(url: string, options: BsTempOptions) {
    var prefix = "/";
    var startPath = options.get("startPath");

    if (startPath) {
        if (startPath.charAt(0) === "/") {
            prefix = "";
        }
        url = url + prefix + startPath;
    }

    return url;
}

/**
 * @param {String} external
 * @param {String} local
 * @param {String} scheme
 * @param {Object} options
 * @returns {{local: string, external: string}}
 */
export function getUrls(external, local, scheme, options) {
    var urls: {[index: string]: string} = {
        local: getUrl(
            _makeUrl(scheme, local, options.get("port")),
            options
        )
    };

    if (external !== local) {
        urls.external = getUrl(
            _makeUrl(scheme, external, options.get("port")),
            options
        );
    }

    return urls;
}

/**
 * @param {String} scheme
 * @param {String} host
 * @param {Number} port
 * @returns {String}
 * @private
 */
export function _makeUrl(scheme, host, port) {
    return scheme + "://" + host + ":" + port;
}

export type PortLookupCb = (error: null|Error, port: number) => void;
/**
 * Get ports
 * @param {Object} options
 * @param {Function} cb
 */
export function getPorts(options: BsTempOptions, cb: PortLookupCb) {
    var port = options.get("port");
    var ports = options.get("ports"); // backwards compatibility
    var host = options.get("listen", "localhost"); // backwards compatibility
    var max;

    if (ports) {
        port = ports.get("min");
        max = ports.get("max") || null;
    }

    var fn: typeof getPort = exports.getPort;
    fn(host, port, max, cb);
}

export function getPort(host: string, port: number|string, max: number|string|null, cb: PortLookupCb) {
    portScanner.findAPortNotInUse(
        port,
        max,
        {
            host: host,
            timeout: 1000
        },
        cb
    );
}

/**
 * @param {String} ua
 * @returns {Object}
 */
export function getUaString(ua) {
    return parser.setUA(ua).getBrowser();
}

/**
 * Open the page in browser
 * @param {String} url
 * @param {Object} options
 * @param {BrowserSync} bs
 */
export function openBrowser(url, options, bs) {
    const open = options.get("open");
    const browser = options.get("browser");

    if (_.isString(open)) {
        if (options.getIn(["urls", open])) {
            url = options.getIn(["urls", open]);
        }
    }

    const fn: typeof opnWrapper = exports.opnWrapper;
    if (open) {
        if (browser !== "default") {
            if (isList(browser)) {
                browser.forEach(function (browser) {
                    fn(url, browser, bs);
                });
            } else {
                fn(url, browser, bs); // single
            }
        } else {
            fn(url, null, bs);
        }
    }
}

/**
 * Wrapper for opn module
 * @param url
 * @param name
 * @param bs
 */
export function opnWrapper(url, name, bs) {
    var options = (function () {
        if (_.isString(name)) {
            return {app: name};
        }
        if (Immutable.Map.isMap(name)) {
            return name.toJS();
        }
        return {};
    })();
    var opn = require("opn");
    opn(url, options).catch(function () {
        bs.events.emit("browser:error");
    });
}

/**
 * @param {Boolean} kill
 * @param {String|Error} [errMessage]
 * @param {Function} [cb]
 */
export function fail(kill, errMessage, cb) {
    if (kill) {
        if (_.isFunction(cb)) {
            if (errMessage.message) {
                // Is this an error object?
                cb(errMessage);
            } else {
                cb(new Error(errMessage));
            }
        }
        process.exit(1);
    }
}

/**
 * Add support for xip.io urls
 * @param {String} host
 * @param {Object} options
 * @returns {String}
 */
export function xip(host, options) {
    var suffix = options.get("hostnameSuffix");
    if (options.get("xip")) {
        return host + ".xip.io";
    }
    if (suffix) {
        return host + suffix;
    }
    return host;
}

/**
 * Determine if an array of file paths will cause a full page reload.
 * @param {Array} needles - filepath such as ["core.css", "index.html"]
 * @param {Array} haystack
 * @returns {Boolean}
 */
export function willCauseReload(needles, haystack) {
    return needles.some(function (needle) {
        return !_.includes(haystack, path.extname(needle).replace(".", ""));
    });
}

export const isList = Immutable.List.isList;
export const isMap = Immutable.Map.isMap;

/**
 * @param {Map} options
 * @returns {Array}
 */
export function getConfigErrors(options) {
    var messages = require("./config").errors;

    var errors = [];

    if (options.get("server") && options.get("proxy")) {
        errors.push(messages["server+proxy"]);
    }

    return errors;
}

/**
 * @param {Map} options
 * @param {Function} [cb]
 */
export function verifyConfig(options, cb) {
    var errors = getConfigErrors(options);
    if (errors.length) {
        fail(true, errors.join("\n"), cb);
        return false;
    }
    return true;
}

export function eachSeries(arr, iterator, callback) {
    callback = callback || function () {
    };
    var completed = 0;
    var iterate = function () {
        iterator(arr[completed], function (err) {
            if (err) {
                callback(err);
                callback = function () {
                };
            } else {
                ++completed;
                if (completed >= arr.length) {
                    callback();
                } else {
                    iterate();
                }
            }
        });
    };
    iterate();
}

/**
 * @param {Immutable.List|Array|String} incoming
 * @returns {Array}
 */
export function arrayify(incoming) {
    if (List.isList(incoming)) {
        return incoming.toArray();
    }
    return [].concat(incoming).filter(Boolean);
}

export function defaultCallback(err?: Error) {
    if (err && err.message) {
        console.error(err.message);
    }
}

export const portscanner = portScanner;
export const connect = require("connect");
export const serveStatic = require("./server/serve-static-wrapper").default();
export const easyExtender = require("easy-extender");
export {UAParser, devIp};
