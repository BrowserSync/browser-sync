/**
 * @module BrowserSync.options
 */
module.exports = {
    /**
     * BrowserSync can watch your files as you work. Changes you make will either
     * be injected into the page (CSS & images) or will cause all browsers to do
     * a full-page refresh. See [isaacs's minimatch](https://github.com/isaacs/minimatch) for more information on glob patterns.
     * @property files
     * @type Array|String
     * @default false
     */
    files: false,

    /**
     * File watching options that get passed along to [Gaze](https://github.com/shama/gaze). Check out the [properties](https://github.com/shama/gaze#properties)
     * section of their docs to see which options they support.
     * for availbable options
     * @property watchOptions
     * @type Object
     * @default undefined
     * @since 1.3.0
     */

    /**
     * Use the built-in static server for basic HTML/JS/CSS websites.
     * @property server
     * @type Object|Boolean
     * @default false
     */
    server: false,

    /**
     * Proxy an EXISTING vhost. BrowserSync will wrap your existing url and provide a different one to use.
     * @property proxy
     * @type String|Boolean
     * @default false
     */
    proxy: false,

    /**
     * @property port
     * @type Number
     * @default 3000
     */
    port: 3000,

    /**
     * Enable https for localhost development. **Note:** Proxy and Tunnel not currently supported.
     * @property https
     * @type Boolean
     * @default undefined
     * @since 1.3.0
     */

    /**
     * @property ghostMode
     * @param {Boolean} [clicks=true]
     * @param {Boolean} [scroll=true]
     * @param {Boolean} [location=false]
     * @param {Boolean} [forms=true]
     * @param {Boolean} [forms.submit=true]
     * @param {Boolean} [forms.inputs=true]
     * @param {Boolean} [forms.toggles=true]
     * @type Object
     */
    ghostMode: {
        clicks: true,
        scroll: true,
        location: false,
        forms: {
            submit: true,
            inputs: true,
            toggles: true
        }
    },

    /**
     * Can be either "info", "debug" or "silent"
     * @property logLevel
     * @type String
     * @default info
     */
    logLevel: "info",

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
     * Can be true, "local", "external" or "tunnel"
     * @property open
     * @type Boolean|String
     * @default true
     */
    open: true,

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
    ],
    debugInfo: true
};