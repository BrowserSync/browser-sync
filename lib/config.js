/*
 |--------------------------------------------------------------------------
 | Browser-sync config file
 |--------------------------------------------------------------------------
 |
 | Please report any issues you encounter:
 |  https://github.com/shakyShane/browser-sync/issues
 |
 | For up-to-date information about the options:
 |  https://github.com/shakyShane/browser-sync/wiki/Working-with-a-Config-File
 |
 */
module.exports = {

    /*
     |--------------------------------------------------------------------------
     | Files
     |--------------------------------------------------------------------------
     |
     | Here you can specify which files should be watched for changes.
     | Below are a few examples of accepted patterns.
     | For more information check: https://github.com/isaacs/minimatch
     |
     */
    // Examples:
    // files: "css/*.css",
    // files: ["css/*.css", "css/**/*.css"],
    // files: ["css/*.css", "app/*.html"],
    files: [],

    /*
     |--------------------------------------------------------------------------
     | Directories or files to exclude
     |--------------------------------------------------------------------------
     |
     | For performance reasons, you may want to ignore certain directories from
     |
     */
    // Examples:
    // exclude: ["css/dist"],
    // exclude: ["css/*.css"],
    // exclude: ["css/core.css"]
    exclude: false,

    /*
     |--------------------------------------------------------------------------
     | Ghost Mode
     |--------------------------------------------------------------------------
     |
     | Enable/disable individual ghostMode options.
     |
     */
    ghostMode: {
        clickedLinks: false, // Allow click events on <a> elements (buggy, avoid if possible)
        clicks: true,
        links: true,
        forms: true,
        scroll: true
    },

    /*
     |--------------------------------------------------------------------------
     | Server
     |--------------------------------------------------------------------------
     |
     | Use the built-in server when working with static HTML files.
     | Note: NOT to be used if you're using the proxy.
     |
     |   server: {
     |       baseDir: "app"
     |   },
     |   server: {
     |       baseDir: "./"
     |   },
     |   server: {
     |       baseDir: "./",
     |       index: "index.htm"
     |   },
     */
    server: false,

    /*
     |--------------------------------------------------------------------------
     | Proxy
     |--------------------------------------------------------------------------
     |
     | If you have an existing server setup, you can use the proxy to inject the snippets.
     | Note: NOT to be used if you're using the built-in server.
     |
     | IP based proxy example.
     |   proxy: {
     |      host: "127.0.0.1",
     |      port: 8000
     |   }
     |
     | vhost based proxy example.
     |   proxy: {
     |      host: "local.dev",
     |      port: 8000,
     |   }
     |
     */
    proxy: false,

    /*
     |--------------------------------------------------------------------------
     | Open (true|false)
     |--------------------------------------------------------------------------
     |
     | Should the browser be opened automatically?
     |
     */
    open: true,

    /*
     |--------------------------------------------------------------------------
     | Timestamps (true|false)
     |--------------------------------------------------------------------------
     |
     | Should timestamps be appended to injected files?
     | (if you don't know why you would ever need to turn this off, then leave it on)
     |
     */
    timestamps: true,

    /*
     |--------------------------------------------------------------------------
     | File Timeout (milliseconds)
     |--------------------------------------------------------------------------
     |
     | If you're using a pre-processor (like SASS) & you find that the file watching is erratic,
     | you can increase the amount of time to wait after a file changed here.
     |
     */
    fileTimeout: 1000,

    /*
     |--------------------------------------------------------------------------
     | Inject Changes
     |--------------------------------------------------------------------------
     |
     | Browser Sync will attempt to inject changes where possible (such as CSS, Images).
     | If your situation requires a full page reload for css changes, change this to false
     |
     */
    injectChanges: true,

    /*
     |--------------------------------------------------------------------------
     | Scroll Throttle (milliseconds)
     |--------------------------------------------------------------------------
     |
     | If you experience any problems with the scroll sync, you can throttle how quickly the events
     | are sent. (0-200 works best)
     |
     */
    scrollThrottle: 0,

    /*
     |--------------------------------------------------------------------------
     | Notify (true|false)
     |--------------------------------------------------------------------------
     |
     | By default, Browser-Sync will flash a message in the browser when a file changes,
     | you can turn it off here if you don't want it.
     |
     */
    notify: true,

    /*
     |--------------------------------------------------------------------------
     | Host
     |--------------------------------------------------------------------------
     |
     | Browser-sync will auto detect a suitable IP to be used, if that doesn't work, or
     | if you already know which IP to use - you can specify it here.
     |
     |   host: "192.168.0.4"
     |
     */
    host: null,

    /*
     |--------------------------------------------------------------------------
     | Excluded File Types
     |--------------------------------------------------------------------------
     |
     | If you find a certain file-type is not working well with the proxy/server
     | add the file extension here.
     |
     |   eg:
     |       excludedFileTypes: ["ogg", "mp4"]
     |
     */
    excludedFileTypes: []

};
