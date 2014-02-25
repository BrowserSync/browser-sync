/*global window*/
/*global document*/
/*global ___socket___*/
(function (window, socket) {
    "use strict";

    var scope = {
        ghostMode: {
            enabled: true,
            cache: {}
        }
    };

    var options = {
        tagNames: {
            "css": "link",
            "jpg": "img",
            "jpeg": "img",
            "png": "img",
            "svg": "img",
            "gif": "img",
            "js": "script"
        },
        attrs: {
            "link": "href",
            "img": "src",
            "script": "src"
        }
    };

    var styles = [
        "background-color: black",
        "color: white",
        "padding: 10px",
        "display: none",
        "font-family: sans-serif",
        "position: absolute",
        "z-index: 1000",
        "right: 0px"
    ];

    var notifyElem;

    var browserSync = {
        /**
         * @param {Object} scope
         * @param {Object} options
         * @param {Object} utils
         * @param {Object} [listeners
         */
        processOptions: function (scope, options, utils, listeners) {
            scope.options = options;
            if (options.ghostMode) {
                this.initGhostMode(options.ghostMode, utils, listeners);
            }
            if (options.notify) {
                notifyElem = this.createNotifyElem(styles || null);
                this.notify("Connected to BrowserSync", notifyElem);
            }
        },
        /**
         * Helper to override scope properties
         * @param options
         */
        setOptions: function (options) {
            if (scope) {
                scope.options = options;
            }
        },
        /**
         * @param {Array} [styles]
         * @returns {HTMLElement}
         */
        createNotifyElem: function (styles) {

            var elem = document.createElement("DIV");
            elem.id = "notifyElem";

            var html = document.getElementsByTagName("HTML")[0];
            html.style.position = "relative";

            if (styles) {
                elem.style.cssText = styles.join(";");
            }

            document.getElementsByTagName("body")[0].appendChild(elem);
            return elem;
        },
        /**
         * @param {String} message
         * @param {HTMLElement} elem
         * @param {Number} [timeout]
         */
        notify: function (message, elem, timeout) {
            if(!document.getElementById("notifyElem")) {
                notifyElem = this.createNotifyElem(styles || null);
            }
            elem.innerHTML = message;
            elem.style.top = ghost.getScrollTop() + "px";
            elem.style.display = "block";

            window.setTimeout(function () {
                elem.style.display = "none";
            }, timeout || 1000);

            return elem;
        },
        /**
         * @param {Object} ghostMode
         * @param {Object} utils
         * @param {Object} listeners
         */
        initGhostMode: function (ghostMode, utils, listeners) {

            if (ghostMode.clicks) {
                ghost.initClickEvents(scope, utils, listeners.click);
            }

            if (ghostMode.scroll) {
                ghost.initEvents(scope, ["scroll"], utils, listeners);
            }

            var yPos = browserSyncActions.getScrollFromHref(window.location.href);
            if (yPos) {
                window.scrollTo(0, yPos);
            }

            if (ghostMode.forms) {

                // text inputs
                var inputs = ghost.getInputs();

                /**
                 * [0] = HTMLElements or tag-name as strings
                 * [1] = browser event name
                 * [2] = callback function
                 * @type {Array}
                 */
                var items = [
                    [ inputs.texts, "keyup", "keyup" ],
                    [ inputs.radios, "click", "forceChange" ],
                    [ inputs.radios, "change", "radioChange" ],
                    [ inputs.checkboxes, "click", "forceChange" ],
                    [ inputs.checkboxes, "change", "checkboxChange" ],
                    [ "textarea", "keyup", "keyup" ],
                    [ "select", "change", "selectChange" ],
                    [ "form", "submit", "formSubmit" ],
                    [ "form", "reset", "formReset" ]
                ];

                for (var i = 0, n = items.length; i < n; i += 1) {
                    ghost.addBrowserEvents(items[i][0], items[i][1], listeners[items[i][2]], utils);
                }
            }
        },
        /**
         * @param {Object} scope
         * @param {Object} data
         * @param {Object} actions
         * @returns {HTMLElement}
         */
        reloadEvent: function (scope, data, actions) {

            var transformedElem;

            if (data.url || !scope.options.injectChanges) {
                actions.reloadBrowser(true);
            }

            if (data.assetFileName && data.fileExtension) {


                var domData = this.getElems(data.fileExtension);
                var elems = this.getMatches(domData.elems, data.assetFileName, domData.attr);

                if (elems.length && scope.options.notify) {
                    browserSync.notify("Injected: " + data.assetFileName, notifyElem);
                }

                for (var i = 0, n = elems.length; i < n; i += 1) {
                    transformedElem = actions.swapFile(elems[i], domData.attr, scope);
                }
            }

            return transformedElem;
        },
        /**
         * Get dom elements based on a file extension
         * @param {string} fileExtension
         * @returns {{elems: (*|document.getElementsByTagName), attr: string}}
         */
        getElems: function (fileExtension) {

            var tagName = this.getTagName(fileExtension);
            var attr = this.getAttr(tagName);

            return {
                elems: document.getElementsByTagName(tagName),
                attr: attr
            };
        },
        /**
         * @param {string} fileExtension
         * @returns {string}
         */
        getTagName: function (fileExtension) {
            return options.tagNames[fileExtension];
        },
        /**
         * @param {string} tagName
         * @returns {string}
         */
        getAttr: function (tagName) {
            return options.attrs[tagName];
        },
        /**
         * @param {Array} elems - dom nodes
         * @param {string} url
         * @param {string} attr
         * @returns {Array}
         */
        getMatches: function (elems, url, attr) {

            var matches = [];

            for (var i = 0, len = elems.length; i < len; i += 1) {
                if (elems[i][attr].indexOf(url) !== -1) {
                    matches.push(elems[i]);
                }
            }

            return matches;
        }
    };

    /**
     * @type {{reloadBrowser: Function, swapFile: Function}}
     */
    var browserSyncActions = {
        /**
         * @param {Boolean} confirm
         */
        reloadBrowser: function (confirm) {
            if (confirm) {
                window.location.href = this.getPath(window.location.href, ghost.getScrollTop());
            }
        },
        /**
         * Retrieve y scroll from href
         * @param {String} href
         * @returns {String|Boolean}
         */
        getScrollFromHref: function (href) {
            var match = /bs_page_y=(\d{1,10})/.exec(href);
            if (match) {
                return match[1];
            }
            return false;
        },
        /**
         * @param {String} current
         * @param {Number} scrollTop
         * @returns {String}
         */
        getPath: function (current, scrollTop) {
            var regex = /(bs_page_y=\d{1,5})/;
            var prefix = "?";
            if (current.match(regex)) {
                return current.replace(regex, function () {
                    return "bs_page_y=" + scrollTop;
                });
            }
            if (current.match(/\?/)) {
                prefix = "&";
            }
            return current + prefix + "bs_page_y=" + scrollTop;
        },
        /**
         * @param {HTMLElement} elem
         * @param {String} attr
         * @param {Object} [scope]
         * @returns {{elem: *, timeStamp: number}}
         */
        swapFile: function (elem, attr, scope) {

            var currentValue = elem[attr];
            var timeStamp = new Date().getTime();
            var suffix = "?rel=" + timeStamp;

            var justUrl = /^[^\?]+(?=\?)/.exec(currentValue);

            if (justUrl) {
                currentValue = justUrl[0];
            }

            if (scope && scope.options) {
                if (scope.options.timestamps === false) {
                    suffix = "";
                }
            }

            elem[attr] = currentValue + suffix;

            return {
                elem: elem,
                timeStamp: timeStamp
            };
        }
    };


    /**
     * Ghost Mode
     * @type {{getScroll: Function}}
     */
    var ghost = {
        /**
         * Get scroll position cross-browser
         * @returns {Array}
         */
        getScrollPosition: function () {

            var sx, sy, d = document, r = d.documentElement, b = d.body;

            if (window.pageYOffset !== undefined) {
                return [window.pageXOffset, window.pageYOffset];
            }

            sx = r.scrollLeft || b.scrollLeft || 0;
            sy = r.scrollTop || b.scrollTop || 0;

            return [sx, sy];
        },
        /**
         * Get percentage of scroll position
         * @returns {Array}
         */
        getScrollPercentage: function (scrollSpace, scrollPosition) {

            var psx = scrollPosition[0] / scrollSpace[0];
            var psy = scrollPosition[1] / scrollSpace[1];

            return [psx, psy];
        },
        /**
         * Get scroll space in pixels
         * @returns {Array}
         */
        getScrollSpace: function () {
            var ssx, ssy, d = document, r = d.documentElement,
                    b = d.body;

            ssx = b.scrollHeight - r.clientWidth;
            ssy = b.scrollHeight - r.clientHeight;

            return [ssx, ssy];
        },
        /**
         * Get just the Y axis of scroll
         * @returns {Number}
         */
        getScrollTop: function () {
            return this.getScrollPosition()[1];
        },
        /**
         * Get just the percentage of Y axis of scroll
         * @returns {Number}
         */
        getScrollTopPercentage: function () {
            var scrollSpace = this.getScrollSpace();
            var scrollPosition = this.getScrollPosition();
            return this.getScrollPercentage(scrollSpace, scrollPosition)[1];
        },
        /**
         * @param {Object} ghostMode
         * @param {number} y
         */
        setScrollTop: function (ghostMode, y) {
            ghostMode.enabled = false;
            window.scrollTo(0, y);
        },
        /**
         * @param {HTMLElement} elem
         * @param {String} evt
         */
        simulateEvent: function (elem, evt) {

            var evObj;

            if (document.createEvent) {

                evObj = document.createEvent("MouseEvents");
                evObj.initEvent(evt, true, true);
                elem.dispatchEvent(evObj);

            } else {

                if (document.createEventObject) {
                    evObj = document.createEventObject();
                    evObj.cancelBubble = true;
                    elem.fireEvent("on" + evt, evObj);
                }
            }
        },
        /**
         * @param {Object} cache
         * @param {String} id
         * @returns {}
         */
        checkCache: function (cache, id) {
            var elem;
            if (cache[id]) {
                return cache[id].elem;
            } else {
                cache.called = (cache.called) ? cache.called += 1 : 1; // for testing
                elem = document.getElementById(id);
                if (elem) {

                    cache[id] = {};
                    cache[id].elem = elem;

                    return elem;
                }
            }

            return false;
        },
        /**
         * Add global click event with delegation
         * @param {Object} scope
         * @param {Object} utils
         * @param {Function} callback
         */
        initClickEvents: function (scope, utils, callback) {
            var body = document.getElementsByTagName("body")[0];
            this.composeElementEvent(body, utils, "click", callback);
        },
        /**
         * @param {Object} scope
         * @param {Array} events
         * @param {Object} utils
         * @param {Object} callbacks
         */
        initEvents: function (scope, events, utils, callbacks) {
            var evt;
            for (var i = 0, n = events.length; i < n; i += 1) {
                evt = events[i];
                this.composeWindowEvent(utils, evt, callbacks[evt]);
            }
        },
        /**
         * Make a cross browser event handler system
         * @param {Object} utils
         * @param {string} event
         * @param {Function} callback
         */
        composeWindowEvent: function (utils, event, callback) {
            window[utils.eventListener](utils.prefix + event, callback, false);
        },
        /**
         * Add an event to a dom element
         * @param {HTMLElement} elem
         * @param {Object} utils
         * @param {string} event
         * @param {Function} callback
         */
        composeElementEvent: function (elem, utils, event, callback) {
            elem[utils.eventListener](utils.prefix + "click", callback, false);
        },
        /**
         * Emit an event
         * @param {string} name [ the event name sent back to the server ]
         * @param {Object} data
         */
        emitEvent: function (name, data) {
            if (socket && socket.emit) {

                // send relative path of where the event is sent
                data.url = window.location.pathname;

                socket.emit(name, data);
            }
        },
        /**
         * @param {Array|String} elems - nodelist
         * @param {String} event
         * @param {Function} callback
         * @param {Object} utils
         */
        addBrowserEvents: function (elems, event, callback, utils) {

            if (typeof elems === "string") {
                elems = document.getElementsByTagName(elems);
            }

            for (var i = 0, n = elems.length; i < n; i += 1) {
                elems[i][utils.eventListener](utils.prefix + event, callback, false);
            }
        },
        /**
         * @returns {{texts: Array, radios: Array, checkboxes: Array}}
         */
        getInputs: function () {

            var inputs = document.getElementsByTagName("input");

            var texts = [];
            var radios = [];
            var checkboxes = [];

            var inputTypes = ["text", "email", "url", "tel", "password"];

            for (var i = 0, n = inputs.length; i < n; i += 1) {

                var type = inputs[i].type;

                for (var ii = 0, nn = inputTypes.length; ii < nn; ii += 1) {
                    if (type === inputTypes[ii]) {
                        texts.push(inputs[i]);
                        break;
                    }
                }

                if (inputs[i].type === "radio") {
                    radios.push(inputs[i]);
                }

                if (inputs[i].type === "checkbox") {
                    checkboxes.push(inputs[i]);
                }
            }

            return {
                texts: texts,
                radios: radios,
                checkboxes: checkboxes
            };
        },
        listeners: {
            scroll: function () {

                var scrollTop = {
                    raw:          ghost.getScrollTop(), // Get px of y axis of scroll
                    proportional: ghost.getScrollTopPercentage() // Get % of y axis of scroll
                };

                var newScroll = new Date().getTime();
                var scrollThrottle = 0;

                if (scope.options && scope.options.scrollThrottle) {
                    scrollThrottle = scope.options.scrollThrottle;
                }

                if (!scope.ghostMode.lastScroll) {
                    scope.ghostMode.scrollTop = scrollTop[0];
                    scope.ghostMode.lastScroll = new Date().getTime();
                }

                if (newScroll > scope.ghostMode.lastScroll + scrollThrottle) { // throttle scroll events

                    if (scope.ghostMode.enabled) {
                        scope.ghostMode.lastScroll = newScroll;

                        ghost.emitEvent("scroll", {
                            position: scrollTop
                        });
                    }
                }

                scope.ghostMode.enabled = true;
            },
            /**
             * Handle aLL click events by indexing the dom element that was clicked
             * @param {Event} event
             * @param {Object} localScope
             */
            click: function (event, localScope) {

                if (!localScope) {
                    localScope = scope;
                }

                if (localScope.ghostMode.enabled) {

                    var elem = event.target || event.srcElement;
                    var tagName = elem.tagName;

                    if (elem.type === "checkbox" || elem.type === "radio") {
                        return;
                    }

                    var allElems = document.getElementsByTagName(tagName);
                    var index = Array.prototype.indexOf.call(allElems, elem);

                    var data = {
                        tagName: tagName,
                        index: index
                    };

                    ghost.emitEvent("click", data);

                } else {
                    localScope.ghostMode.enabled = true;
                }
            },
            keyup: function (event) {
                var target = event.target || event.srcElement;
                if (!target.id) {
                    return; // don't submit the event if we can't identify the input field.
                }
                ghost.emitEvent("input:text", {
                    id: target.id,
                    value: target.value
                });
            },
            forceChange: function () {
                this.blur();
                this.focus();
            },
            radioChange: function (event) {
                var target = event.target || event.srcElement;
                ghost.emitEvent("input:radio", {
                    id: target.id,
                    value: target.value
                });
            },
            checkboxChange: function (event) {
                if (!scope.ghostMode.enabled) {
                    return;
                }
                var target = event.target || event.srcElement;
                ghost.emitEvent("input:checkbox", { id: target.id, checked: target.checked });
            },
            selectChange: function (event) {
                var target = event.target || event.srcElement;
                ghost.emitEvent("input:text", { id: target.id, value: target.value });
            },
            formSubmit: function (event) {
                var target = event.target || event.srcElement;
                ghost.emitEvent("form:submit", { id: target.id });
            },
            formReset: function (event) {
                var target = event.target || event.srcElement;
                ghost.emitEvent("form:reset", { id: target.id });
            }
        },
        /**
         * Cross-browser event helpers
         */
        utils: {
            eventListener: (window.addEventListener) ? "addEventListener" : "attachEvent",
            removeEventListener: (window.removeEventListener) ? "removeEventListener" : "detachEvent",
            prefix: (window.addEventListener) ? "" : "on"
        },
        /**
         * @returns {string}
         */
        getCurrentPath: function () {
            return window.location.pathname;
        },
        /**
         * @returns {boolean}
         */
        canSync: function (url) {
            return url === this.getCurrentPath();
        }
    };

    /** Test mode stuff **/
    if (window.__karma__) {
        window.BrowserSync = browserSync;
        window.browserSyncActions = browserSyncActions;
        window.ghost = ghost;
        window.scope = scope;
        socket.on = function () {
        };
    }

    socket.on("connection", function (options) {
        browserSync.processOptions(scope, options, ghost.utils, ghost.listeners);
    });

    socket.on("reload", function (data) {
        if (data) {
            browserSync.reloadEvent(scope, data, browserSyncActions);
        }
    });

    socket.on("click", function (data) {

        // ensure synchronization occurs only between same pages
        if (!ghost.canSync(data.url)) {
            return;
        }

        var elems = document.getElementsByTagName(data.tagName);
        var elem = elems[data.index];

        scope.ghostMode.enabled = false;

        if (elem) {
            ghost.simulateEvent(elem, "click");
        }
    });

    socket.on("location", function (data) {
        if (data.url) {
            window.location = data.url;
        }
    });

    socket.on("scroll", function (data) {

        // ensure synchronization occurs only between same pages
        if (!ghost.canSync(data.url)) {
            return;
        }

        scope.ghostMode.enabled = false;
        if (scope.options.scrollProportionally) {
            var scrollSpace = ghost.getScrollSpace();
            window.scrollTo(0, scrollSpace[1] * data.position.proportional); // % of y axis of scroll to px
        } else {
            window.scrollTo(0, data.position.raw);
        }
    });

    socket.on("input:text", function (data) {

        // ensure synchronization occurs only between same pages
        if (!ghost.canSync(data.url)) {
            return;
        }

        scope.ghostMode.enabled = false;
        var elem = ghost.checkCache(scope.ghostMode.cache, data.id);
        elem.value = data.value;
    });

    socket.on("input:radio", function (data) {

        // ensure synchronization occurs only between same pages
        if (!ghost.canSync(data.url)) {
            return;
        }

        scope.ghostMode.enabled = false;
        var elem = ghost.checkCache(scope.ghostMode.cache, data.id);
        elem.checked = true;
    });

    socket.on("input:checkbox", function (data) {


        // ensure synchronization occurs only between same pages
        if (!ghost.canSync(data.url)) {
            return;
        }

        scope.ghostMode.enabled = false;
        var elem = ghost.checkCache(scope.ghostMode.cache, data.id);
        elem.checked = data.checked;
    });

    socket.on("form:submit", function (data) {

        // ensure synchronization occurs only between same pages
        if (!ghost.canSync(data.url)) {
            return;
        }

        scope.ghostMode.enabled = false;
        document.forms[data.id].submit();
    });

    socket.on("form:reset", function (data) {

        // ensure synchronization occurs only between same pages
        if (!ghost.canSync(data.url)) {
            return;
        }

        scope.ghostMode.enabled = false;
        document.forms[data.id].reset();
    });

}(window, (typeof ___socket___ === "undefined") ? {} : ___socket___));
