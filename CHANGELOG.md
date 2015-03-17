<a name"2.2.5"></a>
### 2.2.5 (2015-03-17)


#### Features

* **plugins:** Allow plugins to be given inline within options hash ([fd4ccd9e](https://github.com/BrowserSync/browser-sync/commit/fd4ccd9e))


### 2.2.4 (2015-03-13)


#### Bug Fixes

* **reload:** Allow multiple instances to call their own `.reload()` method - ([da53dc21](https://github.com/BrowserSync/browser-sync/commit/da53dc21c6f7afd801a9f00489a6df2ab46156bb), closes [#511](https://github.com/BrowserSync/browser-sync/issues/511))


### 2.2.3 (2015-03-08)


#### Bug Fixes

* **socket:** Set heartbeat interval correctly - ([7621c0de](https://github.com/BrowserSync/browser-sync/commit/7621c0dece1fea6c170ffdc117bd7c67be2138ed), closes [#499](https://github.com/BrowserSync/browser-sync/issues/499))


### 2.2.2 (2015-03-04)


#### Bug Fixes

* **paths:** Fix regression with absolute/relative paths to scripts/sockets/https etc - ([2386fe1b](https://github.com/BrowserSync/browser-sync/commit/2386fe1bbde175b18211ef9b242b6af0bf11128c), closes [#463](https://github.com/BrowserSync/browser-sync/issues/463))
* **snippet:** Allow serving the client js over https when in snippet mode - ([196bafbe](https://github.com/BrowserSync/browser-sync/commit/196bafbee2b09c2a1e8b09a988a2c8aa43bac2b9), closes [#459](https://github.com/BrowserSync/browser-sync/issues/459))
* **socket:** Bump socket io + client to fix #477 & https://github.com/BrowserSync/browser-syn ([659c281e](https://github.com/BrowserSync/browser-sync/commit/659c281eac8ab8343a7ba7b13fa532560dc1bd9c))


### 2.1.4 (2015-02-18)


#### Bug Fixes

* **cli:** allow disable injection via cli - ([12ffbd79](https://github.com/BrowserSync/browser-sync/commit/12ffbd793443c7ede191aad55bcd530e566f0947), closes [#444](https://github.com/BrowserSync/browser-sync/issues/444))
* **snippet:**
  * Allow serving the client js over https when in snippet mode - ([196bafbe](https://github.com/BrowserSync/browser-sync/commit/196bafbee2b09c2a1e8b09a988a2c8aa43bac2b9), closes [#459](https://github.com/BrowserSync/browser-sync/issues/459))
  * Allow serving the snippet on secure server + base url - re: #437 ([96d689c0](https://github.com/BrowserSync/browser-sync/commit/96d689c0830975dbf2baee5aaaaa396415052512))
  * Always use full url path for scripts - ([14bd6f51](https://github.com/BrowserSync/browser-sync/commit/14bd6f5126c52228a0ed306a118feac0e65c50db), closes [#437](https://github.com/BrowserSync/browser-sync/issues/437))


## 2.1.0 (2015-02-16)


#### Features

* **https:** Add HTTPS proxying - re: #399 ([09dbca6e](https://github.com/BrowserSync/browser-sync/commit/09dbca6e3e60fa699ca2519d56ada3cbd5a2237b))
* **proxy:** Allow user-specified proxy request headers ([0c303a7e](https://github.com/BrowserSync/browser-sync/commit/0c303a7e4a8bafa554d42c6895698b7338d036f4), closes [#430](https://github.com/BrowserSync/browser-sync/issues/430))


### 2.0.1 (2015-02-10)


#### Bug Fixes

* **cli:**
  * Ensure server options are merged from command line ([8d677328](https://github.com/BrowserSync/browser-sync/commit/8d677328a779502ba6f6e16b74f125dc2caeaf92))
  * explode files args when given on command line., ([18324f0a](https://github.com/BrowserSync/browser-sync/commit/18324f0a7b4d3c49bd16800a7ba77cf13ea2449a), closes [#425](https://github.com/BrowserSync/browser-sync/issues/425), [#426](https://github.com/BrowserSync/browser-sync/issues/426))
  * Don't double-merge cli options, re: #417 ([057d97f3](https://github.com/BrowserSync/browser-sync/commit/057d97f35786f120bc2057c884c80c5ce95aaf79))
* **https:** Ensure HTTPS option is used in legacy mode + top level, re: #427 ([799c0a59](https://github.com/BrowserSync/browser-sync/commit/799c0a59cd152eb11e6f8e66a1d3adcf082624f7))
* **proxy:**
  * use path as startPath if given as proxy option ([f4ac4c59](https://github.com/BrowserSync/browser-sync/commit/f4ac4c595a479b44676824cdbdaa34cc1dc9d966))
  * Bump Foxy module to fix issues with redirects, ([e5d8fe18](https://github.com/BrowserSync/browser-sync/commit/e5d8fe180bfd46f1380ec1f532d81f62f2f6ab11), closes [#381](https://github.com/BrowserSync/browser-sync/issues/381))
* **reload:** Bump browser-sync-client fix ##369 ([9bcf1086](https://github.com/BrowserSync/browser-sync/commit/9bcf108694f0e51bafc3bd6d0a584781e2950f68))
* **stream:** Don't log file info when once: true - fixes https://github.com/google/web-starter-kit/issues/593 ([8f4d7275](https://github.com/BrowserSync/browser-sync/commit/8f4d7275d4dfa6e22dec4b87d19b3be51bab8af3))


#### Features

* **core:** Use immutable data internally to enable advanced features needed in upcoming UI  ([b5d6d9c1](https://github.com/BrowserSync/browser-sync/commit/b5d6d9c1866cf8451cf235dc3bca674af9e6d767))
* **options:**
  * Allow silent setting of options ([31e196a0](https://github.com/BrowserSync/browser-sync/commit/31e196a0e900356cf5cbb9b1e8a4c3202011d01e))
  * added reloadOnRestart option - https://github.com/shakyShane/browser-sync/issues ([b1bcfa81](https://github.com/BrowserSync/browser-sync/commit/b1bcfa81638b1f99fed7d71ee051c00ceebaf8f9))
* **server:** add serveFile method for plugin use ([c5007871](https://github.com/BrowserSync/browser-sync/commit/c50078717f291f3cb301b0bc315eac1b42f6d7b6))
* **snippet:** Add black/white lists - ([6a2a296e](https://github.com/BrowserSync/browser-sync/commit/6a2a296ee05312d56de3ae47f5dfb6e04f877692), closes [#373](https://github.com/BrowserSync/browser-sync/issues/373))
* **tunnel:** Switch to ngrok - re: #192 ([7359435c](https://github.com/BrowserSync/browser-sync/commit/7359435ca4efd429c9421aa912a036f82d022d82))


### 1.8.2 (2014-12-22)


#### Bug Fixes

* **proxy:** Bump foxy to fix #376 ([fe6c73db](https://github.com/shakyShane/browser-sync/commit/fe6c73db47f82d10ea25b0b8c58b032e972a4663))


#### Features

* **server:** allow to inject browser-sync client.js in custom middlewares ([841c6c31](https://github.com/shakyShane/browser-sync/commit/841c6c31015955ff92cffd937f19f2c78ce27e8d))


### 1.8.1 (2014-12-19)


#### Bug Fixes

* **proxy:** Bump foxy to fix #376 ([284cf84a](https://github.com/shakyShane/browser-sync/commit/284cf84a0390a07d9824972c8ab67ec95cf8109f))


### 1.7.3 (2014-12-16)


#### Features

* **files:** pause/resume ([a3c697f6](https://github.com/shakyShane/browser-sync/commit/a3c697f66b4fcec3966ed77a841e55aafb70f69a))


### 1.6.5 (2014-11-16)


#### Bug Fixes

* **snippet:** Add snippet.ignorePaths option - ([dd9b284b](https://github.com/shakyShane/browser-sync/commit/dd9b284b47f01884996619c012f134c982639b8c), closes [#330](https://github.com/shakyShane/browser-sync/issues/330))


#### Features

* **snippet:** Allow user-provided rule for writing the snippet ([33c4586d](https://github.com/shakyShane/browser-sync/commit/33c4586dce26a4c9672b99d14d29adb064dac6ec))


### 1.6.4 (2014-11-08)


#### Bug Fixes

* **proxy:** Bump Foxy to fix issues with redirects ([e2f30be2](https://github.com/shakyShane/browser-sync/commit/e2f30be2269629a96503ea487b5248ab3b6918ab))


### 1.6.2 (2014-11-02)


#### Bug Fixes

* **options:** Ignore cli options from public api usage fix #314 ([1de4a3b0](https://github.com/shakyShane/browser-sync/commit/1de4a3b06cd888345aa5130a03cad070b1f5b466))


