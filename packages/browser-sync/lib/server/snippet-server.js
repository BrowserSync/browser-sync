// @ts-check
"use strict";

import serverUtils from "./utils.js";

/**
 * Create a server for the snippet
 * @param {import("../browser-sync").default} bs
 * @param scripts
 * @returns {*}
 */
export default function createSnippetServer(bs, scripts) {
    var app = serverUtils.getBaseApp(bs);
    return serverUtils.getServer(app, bs.options);
}
