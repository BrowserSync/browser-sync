# browser-sync [![Build Status](https://travis-ci.org/shakyShane/browser-sync.png?branch=master)](https://travis-ci.org/shakyShane/browser-sync) [![NPM version](https://badge.fury.io/js/browser-sync.png)](http://badge.fury.io/js/browser-sync) [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

> Keep multiple browsers & devices in sync when building websites.

Follow [@browserSync](http://www.twitter.com/browserSync) for news & updates

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

##Install
Using **Grunt**? There's a [separate plugin](https://github.com/shakyShane/grunt-browser-sync) for that

```
npm install -g browser-sync
```

##How to use it
There are currently 2 ways to use browser-sync - **with** a config file & **without** a config file. Both options are explained on the following pages.

1. [With a config file](https://github.com/shakyShane/browser-sync/wiki/Working-with-a-Config-File)
2. [Command line only (no config file)](https://github.com/shakyShane/browser-sync/wiki/Working-with-a-Config-File)


##Screencasts ( < 3 min each )
1. [Using the Static Server with css injecting](http://quick.as/klaqfq7e)
2. [Keeping browsers at the same scroll position](http://quick.as/rl9gfgxd)
3. [Keeping form fields in sync](http://quick.as/zr9ofory)
4. [When should you use the built-in server?](http://quick.as/adkjfk7r)


#### + Laravel (php)
1. [Browser Sync + Laravel 4 (php server & proxy)](http://quick.as/03yt7bw)
2. [Browser Sync + Laravel 4 (Mamp Pro & proxy)](http://quick.as/996hozw)
3. [Browser Sync + Laravel 4 (Config file & Proxy)](http://quick.as/70js4da)
4. [Browser Sync + Laravel 4 (Config file & no proxy)](http://quick.as/j3gtmdz)

#### + Vagrant
1. [Browser Sync + Vagrant](http://quick.as/q0rs9jz)


Want any more? Something specific? ask me nicely [@shaneOsbourne](http://www.twitter.com/shaneOsbourne)

##Support
If you've found Browser-sync useful and would like to contribute to its continued development & support, please feel free to send a donation of any size - it would be greatly appreciated!

[![Support via Gittip](https://rawgithub.com/chris---/Donation-Badges/master/gittip.jpeg)](https://www.gittip.com/shakyshane)
[![Support via PayPal](https://rawgithub.com/chris---/Donation-Badges/master/paypal.jpeg)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=shakyshane%40gmail%2ecom&lc=US&item_name=browser%2dsync)


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
