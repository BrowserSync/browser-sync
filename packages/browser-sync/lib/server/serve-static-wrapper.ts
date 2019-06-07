export default function() {
    const serveStatic = require("serve-static");

    /**
     * Adding a custom mime-type for wasm whilst we wait for
     * the `send` package to be updated.
     */
    const send = require("send");
    send.mime.define({ "application/wasm": ["wasm"] });

    return serveStatic;
}
