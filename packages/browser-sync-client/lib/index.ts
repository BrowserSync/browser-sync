///<reference path="types.ts"/>
import "core-js/es/object/assign"
import 'element-scroll-polyfill';
import { Observable } from "rxjs/Observable";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { zip } from "rxjs/observable/zip";
import { initDocument, initOptions, initSocket, initWindow } from "./socket";
import { initNotify } from "./notify";
import { domHandlers$ } from "./dom-effects";
import { SocketEvent, socketHandlers$ } from "./socket-messages";
import { merge } from "rxjs/observable/merge";
import { initLogger, logHandler$ } from "./log";
import { effectOutputHandlers$ } from "./effects";
import { Nanologger } from "./vendor/logger";
import { scrollRestoreHandlers$, initWindowName } from "./scroll-restore";
import { initListeners } from "./listeners";
import { groupBy } from "rxjs/operators/groupBy";
import { withLatestFrom } from "rxjs/operators/withLatestFrom";
import { mergeMap } from "rxjs/operators/mergeMap";
import { share } from "rxjs/operators/share";
import { filter } from "rxjs/operators/filter";
import { pluck } from "rxjs/operators/pluck";
import { of } from "rxjs/observable/of";

export interface Inputs {
    window$: Observable<Window>;
    document$: Observable<Document>;
    socket$: Observable<SocketEvent>;
    option$: BehaviorSubject<IBrowserSyncOptions>;
    navigator$: Observable<Navigator>;
    notifyElement$: BehaviorSubject<HTMLElement>;
    logInstance$: Observable<Nanologger>;
    io$: BehaviorSubject<any>;
    outgoing$: Observable<any>;
}

const window$ = initWindow();
const document$ = initDocument();
const names$ = initWindowName(window);
const { socket$, io$ } = initSocket();
const option$ = initOptions();
const navigator$ = of(navigator);
const notifyElement$ = initNotify(option$.getValue());
const logInstance$ = initLogger(option$.getValue());
const outgoing$ = initListeners(window, document, socket$, option$);

const inputs: Inputs = {
    window$,
    document$,
    socket$,
    option$,
    navigator$,
    notifyElement$,
    logInstance$,
    io$,
    outgoing$
};

function getStream(name: string, inputs) {
    return function(handlers$, inputStream$) {
        return inputStream$.pipe(
            groupBy(([keyName]) => {
                return keyName;
            }),
            withLatestFrom(handlers$),
            filter(([x, handlers]) => {
                return typeof handlers[x.key] === "function";
            }),
            mergeMap(([x, handlers]) => {
                return handlers[x.key](x.pipe(pluck(String(1))), inputs);
            }),
            share()
        );
    };
}

const combinedEffectHandler$ = zip(
    effectOutputHandlers$,
    scrollRestoreHandlers$,
    (...args) => {
        return args.reduce((acc, item) => ({ ...acc, ...item }), {});
    }
);

const output$ = getStream("[socket]", inputs)(
    socketHandlers$,
    merge(inputs.socket$, outgoing$)
);

const effect$ = getStream("[effect]", inputs)(combinedEffectHandler$, output$);
const dom$ = getStream("[dom-effect]", inputs)(
    domHandlers$,
    merge(effect$, names$)
);

const merged$ = merge(output$, effect$, dom$);

const log$ = getStream("[log]", inputs)(logHandler$, merged$);

log$.subscribe();

// resume$.next(true);

// var socket = require("./socket");
// var shims = require("./client-shims");
// var notify = require("./notify");
// // var codeSync = require("./code-sync");
// const { BrowserSync } = require("./browser-sync");
// var ghostMode = require("./ghostmode");
// var events = require("./events");
// var utils = require("./browser.utils");
//
// const mitt = require("mitt").default;
//
// var shouldReload = false;
// var initialised = false;
//
// /**
//  * @param options
//  */
// function init(options: bs.InitOptions) {
//     if (shouldReload && options.reloadOnRestart) {
//         utils.reloadBrowser();
//     }
//
//     var BS = window.___browserSync___ || {};
//     var emitter = mitt();
//
//     if (!BS.client) {
//         BS.client = true;
//
//         var browserSync = new BrowserSync({ options, emitter, socket });
//
//         // codeSync.init(browserSync);
//
//         // // Always init on page load
//         // ghostMode.init(browserSync);
//         //
//         // notify.init(browserSync);
//         //
//         // if (options.notify) {
//         //     notify.flash("Connected to BrowserSync");
//         // }
//     }
//
//     // if (!initialised) {
//     //     socket.on("disconnect", function() {
//     //         if (options.notify) {
//     //             notify.flash("Disconnected from BrowserSync");
//     //         }
//     //         shouldReload = true;
//     //     });
//     //     initialised = true;
//     // }
// }
//
// /**
//  * Handle individual socket connections
//  */
// socket.on("connection", init);
