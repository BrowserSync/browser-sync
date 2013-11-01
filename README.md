# browser-sync [![Build Status](https://travis-ci.org/shakyShane/browser-sync.png?branch=master)](https://travis-ci.org/shakyShane/browser-sync)

> Keep multiple browsers & devices in sync when building websites.

##Features
1. **Scroll** - I can keep your pages in sync when scrolling.
2. **Forms** - You fill out a form in one browser, I'll copy the data to all the others.
3. **Links** - I'll watch your clicks and make all the browser follow you.
4. **CSS injecting** - I can even watch your CSS files & inject them when they change.
5. **Live Reload** - I can also watch files like HTML and PHP & when they change I can reload all browsers for you.
6. **Built-in Server** - Yep, I can serve static files too. (this is the easiest option actually, explained later)

##When is it useful?
It's pretty useful when used with a single browser, watching a CSS file for changes & injecting it. But the real power comes when you're building responsive sites and using multiple devices/monitors because it can keep all browsers in sync & make your workflow much faster.

##Using Grunt? There's a [plugin](https://github.com/shakyShane/grunt-browser-sync) for that

##How to install it?
```
npm install -g browser-sync
```
####If that doesn't work on a mac, try
```
sudo npm install -g browser-sync
```

##How to use it
Browser-sync is a command-line tool & the `-g` from the command above makes it available everywhere on your system. Just `cd` into your website and run one of the commands below. If any further instructions are needed, you'll be notified on the command line.

###Examples

Watch ALL CSS files in a directory for changes
```
browser-sync --files "app/css/*.css"
```

Watch ALL CSS files & HTML files in a directory for changes
```
browser-sync --files "app/css/*.css, app/*.html"
```

Watch ALL CSS files for changes with a static server
```
browser-sync --files "app/css/*.css" --server
```

Watch ALL CSS files for changes with a static server & specify that the base dir should be "app"
```
browser-sync --files "app/css/*.css" --server "app"
```

Watch ALL CSS files for changes with a static server & specify that the base dir should be "app" & specify the index file (note the missing l)
```
browser-sync --files "app/css/*.css" --server "app" --index "index.htm"
```

Watch ALL CSS files for changes with a static server & specify that the base dir should be "app" & with ghostMode disabled
```
browser-sync --files "app/css/*.css" --server "app" --ghostMode false
```

###Example config file
If you want to, you can provide a config file instead of having to remember all of the command above. Also, a config file allows you to be more specific with options. Here's an example of one that you would put in the root of your project.

```
module.exports = {
    files: "app/css/**/*.css",
    host: "192.168.1.1",
    ghostMode: {
        links: true,
        forms: true,
        scroll: true
    },
    server: {
        baseDir: "app"
    }
};
```
Now, if you called the file `config.js`, you'd simple run

```
browser-sync --config config.js
```

##All available options for use in config file

###files - (default: null)

```
// single file
files: "app/css/style.css"

// multiple files
files: ["app/css/style.css", "app/css/ie.css"]

// multiple files with glob
files: "app/css/*.css"

// multiple globs
files: ["app/css/*.css", "app/**.*.html"]
```

###debugInfo - (default: true)

```
// Don't fill my terminal with info
debugInfo: false

// Give me as much info as possible
debugInfo: true
```

###host - (default: null)
```
// Leave this set as null & browser-sync will try to figure out the correct IP to use.
host: null

// Override host detection if you know the correct IP to use
host: "192.168.1.1"

```

###ghostMode - (default: { links: true, forms: true, scroll: true} )
```
// Here you can disable each feature individually
ghostMode: {
    links: true,
    forms: true,
    scroll: true
}

// Or switch them all off in one go
ghostMode: false
```

###server - (default: null)
```
// Serve files from the app directory
server: {
    baseDir: "app"
}

// Serve files from the root directory
server: {
    baseDir: "./"
}
```

###open - (default: true) - when used with server
```
// Launch a browser window at the correct location
open: true

// Stop the browser from automatically opening
open: false
```

#Full config file example
Save this as `anything-you-like.js`

```
module.exports = {
    files: "app/css/**/*.css",
    debugInfo: true,
    host: "192.168.1.1",
    ghostMode: {
        links: true,
        forms: true,
        scroll: true
    },
    server: {
        baseDir: "app"
    },
    open: false
};
```

Now you can use it by calling it from the command-line

```
browser-sync --config anything-you-like.js
```

#Contributing
Fork this repo, clone it and then run

```
npm install
```
###Testing
Tests are split into two categories: Client & Server

**Client-side tests**
Client-side tests are located in test/client-script/*

// Run the client-side tests & exit
```
grunt karma:unit
```
// Run the client-side tests & re-run on every file-change.
```
grunt karma:watch
```
**Server-side tests**
Server-side tests are located in test/new-server

// Run the server-side tests & exit
```
grunt jasmine_node
```
// Run the server-side tests & re-run on every file-change.
```
grunt watch
```
// Run the server-side tests & client-side tests once & exit.
```
grunt test
```

This is a brand new project so expect bugs & be sure to report them.

## License
Copyright (c) 2013 Shane Osbourne
Licensed under the MIT license.
