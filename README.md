# BrowserSync
[![AppVeyor branch](https://img.shields.io/appveyor/ci/shakyshane/browser-sync/master.svg?style=flat-square&label=windows)](https://ci.appveyor.com/project/shakyShane/browser-sync)
[![Travis branch](https://img.shields.io/travis/BrowserSync/browser-sync/master.svg?style=flat-square&label=linux)](https://travis-ci.org/BrowserSync/browser-sync)
[![Coverage Status](https://img.shields.io/coveralls/BrowserSync/browser-sync.svg?style=flat-square)](https://coveralls.io/r/BrowserSync/browser-sync?branch=master)
[![NPM version](https://img.shields.io/npm/v/browser-sync.svg?style=flat-square)](https://www.npmjs.com/package/browser-sync)
[![Dependency Status](https://img.shields.io/david/BrowserSync/browser-sync.svg?style=flat-square&label=deps)](https://david-dm.org/BrowserSync/browser-sync)
[![devDependency Status](https://img.shields.io/david/dev/BrowserSync/browser-sync.svg?style=flat-square&label=devDeps)](https://david-dm.org/BrowserSync/browser-sync#info=devDependencies)

> Keep multiple browsers & devices in sync when building websites.

<a href="http://www.wearejh.com"><img src="http://cl.ly/image/3Y3O0M2z310j/jh-100-red.png" /></a>

BrowserSync is developed and maintained internally at <a href="http://www.wearejh.com">JH</a>, follow <a href="http://www.twitter.com/browsersync">@BrowserSync</a> on twitter for news & updates.

## Features
Please visit [browsersync.io](http://browsersync.io) for a full run-down of features

## Requirements

BrowserSync works by injecting an asynchronous script tag (`<script async>...</script>`) right after the `<body>` tag
during initial request. In order for this to work properly the `<body>` tag must be present. Alternatively you
can provide a custom rule for the snippet using [snippetOptions](http://www.browsersync.io/docs/options/#option-snippetOptions)

## Upgrading from 1.x to 2.x ?
Providing you havn't accessed any internal properties, everything will just work as
 there are no breaking changes to the public API. Internally however, we now use an
 immutable data structure for storing/retrieving options. So whereas before you could access urls like this...

```js
browserSync({server: true}, function(err, bs) {
    console.log(bs.options.urls.local);
});
```

... you now access them in the following way:

```js
browserSync({server: true}, function(err, bs) {
    console.log(bs.options.getIn(["urls", "local"]));
});
```

## Install and trouble shooting

[browsersync.io docs](http://browsersync.io)

## Integrations / recipes

[BrowserSync recipes](https://github.com/BrowserSync/recipes)

## Support

If you've found Browser-sync useful and would like to contribute to its continued development & support, please feel free to send a donation of any size - it would be greatly appreciated!

[![Support via Gittip](https://rawgithub.com/chris---/Donation-Badges/master/gittip.jpeg)](https://www.gittip.com/shakyshane)
[![Support via PayPal](https://rawgithub.com/chris---/Donation-Badges/master/paypal.jpeg)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=shakyshane%40gmail%2ecom&lc=US&item_name=browser%2dsync)

## Contributors

```
   997	Shane Osbourne
    36	Shinnosuke Watanabe
    19	Shane Daniel
    13	Hugo Bessa
    11	Paul Kinlan
     8	shinnn
     4	Matt Green
     3	Marek 'saji' Augustynowicz
     3	Werner van Deventer
     3	Adam Lynch
     2	Eugeny Vlasenko
     2	Dan Tello
     2	Hugo Dias
     2	Michael Branch
     2	Olivier Combe
     2	Paul Robertson
     2	Piotr Kaleta
     2	Simen Bekkhus
     2	brutaldev
     2	chase_chou
     1	Michael Leigeber
     1	Craig Morris
     1	Paul Love
     1	Benjamín Eidelman
     1	Peter Blazejewicz
     1	Philipp Nowinski
     1	viktor hesselbom
     1	Robert Vock
     1	Christian Vuerings
     1	Cedric Kastner
     1	Carl Henderson
     1	mericson
     1	Sylvain Emery
     1	Tony Holdstock-Brown
     1	Guillaume Lambert
     1	Victor Fernandez de Alba
     1	Imran Sulemanji
     1	Jory Graham
     1	Dimitri Nicolas
     1	Dave Hall
     1	Cameron Spear
     1	Yazhong Liu
```

## License

Apache 2
Copyright (c) 2015 Shane Osbourne
