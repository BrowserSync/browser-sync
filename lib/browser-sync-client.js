'use strict';

/*global window*/
/*global document*/
/*global location*/
/*global ___socket___*/
(function (window, socket) {

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

    var browserSync = {
        /**
         * @param {object} scope
         * @param {object} options
         * @param {object} utils
         * @param {object} [listeners
         */
        processOptions: function (scope, options, utils, listeners) {
            scope.options = options;
            if (options.ghostMode) {
                this.initGhostMode(options.ghostMode, utils, listeners);
            }
        },
        /**
         * @param {object} ghostMode
         * @param {object} utils
         * @param {object} listeners
         */
        initGhostMode: function (ghostMode, utils, listeners) {
            if (ghostMode.links) {
                ghost.initClickEvents(scope, utils, listeners.click);
            }

            if (ghostMode.scroll) {
                ghost.initEvents(scope, ['scroll'], utils, listeners);
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
         * @param {object} scope
         * @param {object} data
         * @param {object} actions
         * @returns {HTMLElement}
         */
        reloadEvent: function (scope, data, actions) {

            var transformedElem;

            if (data.url) {
                actions.reloadBrowser(true);
            }

            if (data.assetFileName && data.fileExtension) {

                var domData = this.getElems(data.fileExtension);
                var elem = this.getMatches(domData.elems, data.assetFileName, domData.attr);

                if (typeof elem !== "undefined") {
                    transformedElem = actions.swapFile(elem, domData.attr);
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
         * @param {array} elems - dom nodes
         * @param {string} url
         * @param {string} attr
         * @returns {HTMLHtmlElement|null}
         */
        getMatches: function (elems, url, attr) {

            var match;

            for (var i = 0, len = elems.length; i < len; i += 1) {
                if (elems[i][attr].indexOf(url) !== -1) {
                    match = i;
                }
            }

            return elems[match];
        }
    };

    /**
     * The actions for the style injector
     * @type {{reloadBrowser: Function, swapFile: Function}}
     */
    var browserSyncActions = {
        /**
         * @param {boolean} confirm
         */
        reloadBrowser: function (confirm) {
            if (confirm) {
                location.reload();
            }
        },
        /**
         * @param {HTMLElement} elem
         * @param {string} attr
         * @returns {{elem: *, timeStamp: number}}
         */
        swapFile: function (elem, attr) {

            var currentValue = elem[attr];

            var justUrl = /^[^\?]+(?=\?)/.exec(currentValue);

            if (justUrl) {
                currentValue = justUrl[0];
            }
            var timeStamp = new Date().getTime();
            elem[attr] = currentValue + "?rel=" + timeStamp;

            return { elem: elem, timeStamp: timeStamp };
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
        getScroll: function () {

            if (window.pageYOffset !== undefined) {
                return [window.pageXOffset, window.pageYOffset];
            }

            var sx, sy, d = document, r = d.documentElement, b = d.body;
            sx = r.scrollLeft || b.scrollLeft || 0;
            sy = r.scrollTop || b.scrollTop || 0;

            return [sx, sy];
        },
        /**
         * Get just the Y axis of scroll
         * @returns {Number}
         */
        getScrollTop: function () {
            return this.getScroll()[1];
        },
        /**
         * @param {object} ghostMode
         * @param {number} y
         */
        setScrollTop: function (ghostMode, y) {
            ghostMode.enabled = false;
            window.scrollTo(0, y);
        },
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

                } else {

                  return false;

                }
            }
        },
        /**
         * Add click events to all anchors on page
         * @param {object} scope
         * @param {object} utils
         * @param {Function} callback
         */
        initClickEvents: function (scope, utils, callback) {
            var elems = document.getElementsByTagName("a");
            for (var i = 0, n = elems.length; i < n; i += 1) {
                this.composeElementEvent(elems[i], utils, "click", callback);
            }
        },
        initEvents: function (scope, events, utils, callbacks) {

            var evt = "scroll";

            for (var i = 0, n = events.length; i < n; i += 1) {
                if (events[i] === evt) {
                    this.composeSingleEvent(utils, evt, callbacks[evt]);
                }
            }
        },
        /**
         * Make a cross browser event handler system
         * @param {object} utils
         * @param {string} event
         * @param {Function} callback
         */
        composeSingleEvent: function (utils, event, callback) {
            window[utils.eventListener](utils.prefix + event, callback, false);
        },
        /**
         * Add an event to a dom element
         * @param {HTMLElement} elem
         * @param {object} utils
         * @param {string} event
         * @param {Function} callback
         */
        composeElementEvent: function (elem, utils, event, callback) {
            elem[utils.eventListener](utils.prefix + "click", callback, false);
        },
        /**
         * Emit an event
         * @param {string} name [ the event name sent back to the server ]
         * @param {object} data
         */
        emitEvent: function (name, data) {
            socket.emit(name, data);
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
         * Get a href value from a clicked element
         * @param {HTMLElement} elem
         * @param {HTMLElement} context
         * @returns {string}
         */
        getHref: function (elem, context) {

            var tagName = elem.tagName;
            var href;

            if (context && context.href) {
                href = context.href;
            } else {
                if (tagName === "A") {
                    href = elem.href;
                } else {
                    // IE 7/8 find the parent Anchor element
                    href = this.getParentHref(elem, 5);
                }
            }

            return href;
        },
        /**
         * Walk backwards up the dom until you find the HREF attr of a link.
         * @param {HTMLElement} elem
         * @param {number} limit
         * @returns {string|boolean}
         */
        getParentHref: function (elem, limit) {

            var getHref = function (elem) {
                if (elem.parentNode.tagName === "A") {
                    return elem.parentNode.href;
                } else {
                    return elem.parentNode;
                }
            };

            var looperElem;
            var currentElem = elem;

            for (var i = 0; i < limit; i += 1) {
                looperElem = getHref(currentElem);
                if (typeof looperElem === "string") {
                    return looperElem;
                } else {
                    currentElem = looperElem;
                }
            }

            return false;
        },
        getInputs: function () {
            var inputs = document.getElementsByTagName("input");

            var texts = [];
            var radios = [];
            var checkboxes = [];

            for (var i = 0, n = inputs.length; i < n; i += 1) {
                if (inputs[i].type === "text") {
                    texts.push(inputs[i]);
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

                var scrollTop = ghost.getScrollTop(); // Get y position of scroll
                var newScroll = new Date().getTime();


                if (!scope.ghostMode.lastScroll) {
                    scope.ghostMode.scrollTop = scrollTop[0];
                    scope.ghostMode.lastScroll = new Date().getTime();
                }

                if (newScroll > scope.ghostMode.lastScroll + 50) { // throttle scroll events

                    if (scope.ghostMode.enabled) {
                        scope.ghostMode.lastScroll = newScroll;
                        ghost.emitEvent("scroll",
                                {
                                    pos: scrollTop, url: window.location.href
                                });
                    }
                }

                scope.ghostMode.enabled = true;

            },
            click: function (event) {
                var data = {
                    url: ghost.getHref(event.target || event.srcElement, this)
                };
                ghost.emitEvent("location", data);
            },
            keyup: function (event) {
                var target = event.target || event.srcElement;
                if (!target.id) {
                  return; // don't submit the event if we can't identify the input field.
                }
                ghost.emitEvent("input:type", {
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
                var target = event.target || event.srcElement;
                ghost.emitEvent("input:checkbox", { id: target.id, checked: target.checked });
            },
            selectChange: function (event) {
                var target = event.target || event.srcElement;
                ghost.emitEvent("input:select", { id: target.id, value: target.value });
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
        utils: {
            eventListener: (window.addEventListener) ? "addEventListener" : "attachEvent",
            removeEventListener: (window.removeEventListener) ? "removeEventListener" : "detachEvent",
            prefix: (window.addEventListener) ? "" : "on"
        }
    };

    /** Test mode stuff **/
    if (window.__karma__) {
        window.browserSync = browserSync;
        window.browserSyncActions = browserSyncActions;
        window.ghost = ghost;
        window.scope = scope;
        socket.on = function () {};
    }

    socket.on("connection", function (options) {
        browserSync.processOptions(scope, options, ghost.utils, ghost.listeners);
    });

    socket.on('reload', function (data) {
        if (data) {
            browserSync.reloadEvent(scope, data, browserSyncActions);
        }
    });

    socket.on('location:update', function (data) {
        if (data.url) {
            window.location = data.url;
        }
    });

    socket.on("scroll:update", function (data) {
        if (data.url === window.location.href) {
            scope.ghostMode.enabled = false;
            window.scrollTo(0, data.position);
        }
    });

    socket.on("input:update", function (data) {
        scope.ghostMode.enabled = false;
        var elem = ghost.checkCache(scope.ghostMode.cache, data.id);
        elem.value = data.value;
    });

    socket.on("input:update:radio", function (data) {
        scope.ghostMode.enabled = false;
        var elem = ghost.checkCache(scope.ghostMode.cache, data.id);
        elem.checked = true;
    });

    socket.on("input:update:checkbox", function (data) {
        scope.ghostMode.enabled = false;
        var elem = ghost.checkCache(scope.ghostMode.cache, data.id);
        elem.checked = data.checked;
    });

    socket.on("form:submit", function (data) {
        scope.ghostMode.enabled = false;
        document.forms[data.id].submit();
    });
    socket.on("form:reset", function (data) {
        scope.ghostMode.enabled = false;
        document.forms[data.id].reset();
    });

}(window, (typeof ___socket___ === "undefined") ? {} : ___socket___));
