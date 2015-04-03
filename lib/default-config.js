"use strict";
/**
 * @module BrowserSync.options
 */
module.exports = {

    /**
     * BrowserSync includes a user-interface that is accessed via a separate port.
     * The UI allows to controls all devices, push sync updates and much more.
     * @property ui
     * @type Object
     * @param {Number} [port=3001]
     * @param {Number} [weinre.port=8080]
     * @since 2.0.0
     * @default false
     */
    ui: {
        port: 3001,
        weinre: {
            port: 8080
        }
    },

    /**
     * BrowserSync can watch your files as you work. Changes you make will either
     * be injected into the page (CSS & images) or will cause all browsers to do
     * a full-page refresh. See [anymatch](https://github.com/es128/anymatch) for more information on glob patterns.
     * @property files
     * @type Array|String
     * @default false
     */
    files: false,

    /**
     * File watching options that get passed along to [Chokidar](https://github.com/paulmillr/chokidar).
     * Check their docs for available options
     * @property watchOptions
     * @type Object
     * @default undefined
     * @since 1.3.0
     */
    watchOptions: {
        /**
         *
         persistent: true,

         ignored: '*.txt',
         ignoreInitial: false,
         followSymlinks: true,
         cwd: '.',

         usePolling: true,
         alwaysStat: false,
         depth: undefined,
         interval: 100,

         ignorePermissionErrors: false,
         atomic: true
         */
    },

    /**
     * Use the built-in static server for basic HTML/JS/CSS websites.
     * @property server
     * @type Object|Boolean
     * @default false
     */
    server: false,

    /**
     * Proxy an EXISTING vhost. BrowserSync will wrap your vhost with a proxy URL to view your site.
     * @property proxy
     * @type String|Object|Boolean
     * @param {String} [target]
     * @param {Function|Array} [middleware]
     * @param {Function} [reqHeaders]
     * @default false
     */
    proxy: false,

    /**
     * @property port
     * @type Number
     * @default 3000
     */
    port: 3000,

    middleware: false,

    /**
     * Enable https for localhost development. **Note:** Proxy and Tunnel not currently supported.
     * @property https
     * @type Boolean
     * @default undefined
     * @since 1.3.0
     */

    /**
     * Clicks, Scrolls & Form inputs on any device will be mirrored to all others.
     * @property ghostMode
     * @param {Boolean} [clicks=true]
     * @param {Boolean} [scroll=true]
     * @param {Boolean} [forms=true]
     * @param {Boolean} [forms.submit=true]
     * @param {Boolean} [forms.inputs=true]
     * @param {Boolean} [forms.toggles=true]
     * @type Object
     */
    ghostMode: {
        clicks: true,
        scroll: true,
        forms: {
            submit: true,
            inputs: true,
            toggles: true
        }
    },

    /**
     * Can be either "info", "debug", "warn", or "silent"
     * @property logLevel
     * @type String
     * @default info
     */
    logLevel: "info",

    /**
     * Change the console logging prefix. Useful if you're creating your
     * own project based on BrowserSync
     * @property logPrefix
     * @type String
     * @default BS
     * @since 1.5.1
     */
    logPrefix: "BS",

    /**
     * @property logConnections
     * @type Boolean
     * @default false
     */
    logConnections: false,

    /**
     * @property logFileChanges
     * @type Boolean
     * @default true
     */
    logFileChanges: true,

    /**
     * Log the snippet to the console when you're in snippet mode (no proxy/server)
     * @property logSnippet
     * @type: Boolean
     * @default true
     * @since 1.5.2
     */
    logSnippet: true,

    /**
     * SINCE 1.7.0! You can control how the snippet is injected
     * onto each page via a custom regex + function.
     * You can also provide patterns for certain urls
     * that should be ignored from the snippet injection.
     * @property snippetOptions
     * @since 2.0.0
     * @param {Array} [blacklist]
     * @param {Array} [whitelist]
     * @param {RegExp} [rule.match=/&lt;body&#91;^&gt;&#93;*&gt;/i]
     * @param {Function} [rule.fn=Function]
     * @type Object
     */
    snippetOptions: {
        whitelist: [],
        blacklist: [],
        rule: {
            match: /<body[^>]*>/i,
            fn: function (snippet, match) {
                return match + snippet;
            }
        }
    },

    /**
     * Add additional HTML rewriting rules.
     * @property rewriteRules
     * @since 2.4.0
     * @type Array|Boolean
     * @default false
     */
    rewriteRules: false,

    /**
     * @property tunnel
     * @type String|Boolean
     * @default null
     */

    /**
     * Some features of BrowserSync (such as `xip` & `tunnel`) require an internet connection, but if you're
     * working offline, you can reduce start-up time by setting this option to `false`
     * @property online
     * @type Boolean
     * @default undefined
     */

    /**
     * Decide which URL to open automatically when BrowserSync starts. Defaults to "local" if none set.
     * Can be true, "local", "external", "ui", "ui-external" or "tunnel"
     * @property open
     * @type Boolean|String
     * @default true
     */
    open: "local",

    /**
     * @property browser
     * @type String|Array
     * @default default
     */
    browser: "default",

    /**
     * Requires an internet connection - useful for services such as [Typekit](https://typekit.com/)
     * as it allows you to configure domains such as `*.xip.io` in your kit settings
     * @property xip
     * @type Boolean
     * @default false
     */
    xip: false,

    hostnameSuffix: false,

    /**
     * Reload each browser when BrowserSync is restarted.
     * @property reloadOnRestart
     * @type Boolean
     * @default true
     */
    reloadOnRestart: true,

    /**
     * The small pop-over notifications in the browser are not always needed/wanted.
     * @property notify
     * @type Boolean
     * @default true
     */
    notify: true,

    /**
     * @property scrollProportionally
     * @type Boolean
     * @default true
     */
    scrollProportionally: true,

    /**
     * @property scrollThrottle
     * @type Number
     * @default 0
     */
    scrollThrottle: 0,

    /**
     * @property reloadDelay
     * @type Number
     * @default 0
     */
    reloadDelay: 0,

    /**
     * User provided plugins
     * @property plugins
     * @type Array
     * @default []
     */
    plugins: [],

    /**
     * @property injectChanges
     * @type Boolean
     * @default true
     */
    injectChanges: true,

    /**
     * @property startPath
     * @type String|Null
     * @default null
     */
    startPath: null,

    /**
     * Whether to minify client script, or not.
     * @property minify
     * @type Boolean
     * @default true
     */
    minify: true,

    /**
     * @property host
     * @type String
     * @default null
     */
    host: null,

    /**
     * @property codeSync
     * @type Boolean
     * @default true
     */
    codeSync: true,

    /**
     * @property timestamps
     * @type Boolean
     * @default true
     */
    timestamps: true,

    clientEvents: [
        "scroll",
        "input:text",
        "input:toggles",
        "form:submit",
        "form:reset",
        "click"
    ],

    /**
     * Alter the script path for complete control over where the BrowserSync
     * Javascript is served from. Whatever you return from this function
     * will be used as the script path.
     * @property scriptPath
     * @default undefined
     * @since 1.5.0
     * @type Function
     */

    /**
     * Configure the Socket.IO path and namespace to avoid collisions. Note: `namespace` can also be a function
     * @property socket
     * @param {String} [path="/browser-sync/socket.io"]
     * @param {String} [clientPath="/browser-sync"]
     * @param {String|Function} [namespace="/browser-sync"]
     * @param {Object} [clients.heartbeatTimeout=5000]
     * @since 1.6.2
     * @type Object
     */
    socket: {
        path: "/browser-sync/socket.io",
        clientPath: "/browser-sync",
        namespace: "/browser-sync",
        clients: {
            heartbeatTimeout: 5000
        }
    },

    /**
     * A map of file-extensions -> dom element.
     * Useful if you're serving files with unusual file extensions
     * @property tagNames
     */
    tagNames: {
        "less": "link",
        "scss": "link",
        "css":  "link",
        "jpg":  "img",
        "jpeg": "img",
        "png":  "img",
        "svg":  "img",
        "gif":  "img",
        "js":   "script"
    },

    injectFileTypes: ["css", "png", "jpg", "jpeg", "svg", "gif", "webp"],
    excludedFileTypes: [
        "js",
        "css",
        "pdf",
        "map",
        "svg",
        "ico",
        "woff",
        "json",
        "eot",
        "ttf",
        "png",
        "jpg",
        "jpeg",
        "webp",
        "gif",
        "mp4",
        "mp3",
        "3gp",
        "ogg",
        "ogv",
        "webm",
        "m4a",
        "flv",
        "wmv",
        "avi",
        "swf",
        "scss"
    ]
};
