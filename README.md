# browser-sync [![Build Status](https://travis-ci.org/shakyShane/browser-sync.png?branch=master)](https://travis-ci.org/shakyShane/browser-sync) [![NPM version](https://badge.fury.io/js/browser-sync.png)](http://badge.fury.io/js/browser-sync) [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

> Keep multiple browsers & devices in sync when building websites.

##Features
1. **Scroll** - I can keep your pages in sync when scrolling.
2. **Forms** - You fill out a form in one browser, I'll copy the data to all the others.
3. **Links** - I'll watch your clicks and make all the browser follow you.
4. **CSS injecting** - I can even watch your CSS files & inject them when they change.
5. **Live Reload** - I can also watch files like HTML and PHP & when they change I can reload all browsers for you.
6. **Built-in Server** - Yep, I can serve static files too if you need me to
7. **Use with any back-end setup** - Browser-sync includes a proxy option so that it can be used with any existing PHP, Rails, Python, Node or ASP.net setup.

##When is it useful?
It's pretty useful when used with a single browser, watching a CSS file for changes & injecting it. But the real power comes when you're building responsive sites and using multiple devices/monitors because it can keep all browsers in sync & make your workflow much faster.

##Support
If you've found Browser-sync useful and would like to contribute to its continued development & support, please feel free to send a donation of any size - it would be greatly appreciated!

[![Support via Gittip](https://rawgithub.com/chris---/Donation-Badges/master/gittip.jpeg)](https://www.gittip.com/shakyshane)
[![Support via PayPal](https://rawgithub.com/chris---/Donation-Badges/master/paypal.jpeg)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=shakyshane%40gmail%2ecom&lc=US&item_name=browser%2dsync)

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

###Watching files

Watch ALL CSS files in a directory for changes

```
browser-sync --files "app/css/*.css"
```

Watch ALL CSS files & HTML files in a directory for changes

```
browser-sync --files "app/css/*.css, app/*.html"
```
###Watching files + your existing Server (proxy)

Using a local.dev vhost

```
browser-sync --proxy "local.dev" --files "app/css/*.css"
```

Using a local.dev vhost with PORT

```
browser-sync --proxy "local.dev:8001" --files "app/css/*.css"
```
Using a an IP based host

```
browser-sync --proxy "192.167.3.2:8001" --files "app/css/*.css"
```

###Watching files + built-in static server (for html, js & css)

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

###Example config file with proxy
If you want to, you can provide a config file instead of having to remember all of the commands above. Also, a config file allows you to be more specific with options. Here's an example of one that you would put in the root of your project.

```
module.exports = {
    files: "app/css/**/*.css",
    host: "192.168.1.1",
    ghostMode: {
        links: true,
        forms: true,
        scroll: true
    },
    proxy: {
        host: "local.dev" // your existing vhost
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
// Leave this set as null & browser-sync will try to figure out the correct IP to use. (about 90% accurate)
host: null

// Override host detection if you know the correct IP to use
host: "192.168.1.1"

```

###ghostMode - (default: { links: true, forms: true, scroll: true} )
```
// Here you can disable/enable each feature individually
ghostMode: {
    links: true,
    forms: true,
    scroll: false
}

// Or switch them all off in one go
ghostMode: false
```

###proxy - (default: null)
NOTE: `"localhost"` not supported here, try to use something else like `"0.0.0.0"` instead if you need to.

```
// use your existing vhost setup
proxy: {
	host: "local.dev"
}

// use your existing vhost setup with a specific port
proxy: {
	host: "local.dev",
	port: 8001
}

// use an IP-based host (like the built-in php server for example)
proxy: {
	host: "192.168.0.4",
	port: 8001
}

```

###server - (default: null)
Server should only be used for static HTML, CSS & JS files. It should NOT be used if you have an existing PHP, Wordpress, Rails setup. That's what the proxy above is for.

```
// Serve files from the app directory
server: {
    baseDir: "app"
}

// Serve files from the app directory, with a specific index filename
server: {
    baseDir: "app",
    index: "index.htm"
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
###notify - (default: true)
Browser-sync will flash a quick message in all connected browsers to confirm that CSS injection has taken place (useful when you're not sure whether the injection worked, or whether your CSS didn't make a difference)

```
// Tell me when a CSS file was injected
notify: true

// Don't show any notifications in the browser.
notify: false
```

#Full config file example with Server
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
    open: false,
    notify: true
};
```
#Full config file example with Proxy
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
	proxy: {
		host: "local.dev" // your existing vhost setup.
	},
    open: true,
    notify: true
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
grunt test:client
```
// Run the client-side tests & re-run on every file-change.
```
grunt karma:watch
```
**Server-side tests**
Server-side tests are located in test/new-server

// Run the server-side tests & exit
```
grunt test:server
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
