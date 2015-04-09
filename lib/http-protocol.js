"use strict";

var queryString = require("query-string");
var proto = exports;

/**
 * Use BrowserSync options + querystring to create a
 * full HTTP/HTTTPS url.
 *
 * Eg. http://localhost:3000/__browser_sync__?method=reload
 * Eg. http://localhost:3000/__browser_sync__?method=reload&args=core.css
 * Eg. http://localhost:3000/__browser_sync__?method=reload&args=core.css&args=core.min
 *
 * @param args
 * @param url
 * @returns {string}
 */
proto.getUrl = function (args, url) {
    return [
        url,
        require("./config").httpProtocol.path,
        "?",
        queryString.stringify(args)
    ].join("");
};

/**
 * Return a middleware for handling the requests
 * @param {BrowserSync} bs
 * @returns {Function}
 */
proto.middleware = function (bs) {

    return function (req, res) {

        var params = queryString.parse(req.url.replace(/^.*\?/, ""));

        if (!params) {
            return;
        }

        try {

            require("./public/" + params.method)(bs.events).apply(null, [params.args]);

            var output = [
                "Called public API method `.%s()`".replace("%s", params.method),
                "With args: " + JSON.stringify(params.args)
            ];

            res.end(output.join("\n"));

        } catch (e) {

            res.writeHead(404, {"Content-Type": "text/plain"});
            res.write("Public API method `" + params.method + "` not found.");
            res.end();
        }
    };
};
