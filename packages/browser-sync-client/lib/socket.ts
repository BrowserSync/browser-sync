import socket = require("socket.io-client");
import { BehaviorSubject, Observable, of, share } from "rxjs";

/**
 * Alias for socket.emit
 * @param name
 * @param data
 */
// export function emit(name, data) {
//     if (io && io.emit) {
//         // send relative path of where the event is sent
//         data.url = window.location.pathname;
//         io.emit(name, data);
//     }
// }
//
// /**
//  * Alias for socket.on
//  * @param name
//  * @param func
//  */
// export function on(name, func) {
//     io.on(name, func);
// }

export function initWindow() {
    return of(window);
}

export function initDocument() {
    return of(document);
}

export function initNavigator() {
    return of(navigator);
}

export function initOptions() {
    return new BehaviorSubject(window.___browserSync___.options);
}

export function initSocket() {
    /**
     * @type {{emit: emit, on: on}}
     */

    const socketConfig = window.___browserSync___.socketConfig;
    const socketUrl = window.___browserSync___.socketUrl;
    const io = socket(socketUrl, socketConfig);
    const onevent = io.onevent;

    const socket$ = Observable.create(obs => {
        io.onevent = function(packet) {
            onevent.call(this, packet);
            obs.next(packet.data);
        };
    }).pipe(share());

    const io$ = new BehaviorSubject(io);

    /**
     * *****BACK-COMPAT*******
     * Scripts that come after Browsersync may rely on the previous window.___browserSync___.socket
     */
    window.___browserSync___.socket = io;

    return { socket$, io$ };
}
