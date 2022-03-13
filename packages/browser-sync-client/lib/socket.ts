import io from "socket.io-client";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {of} from "rxjs/observable/of";
import {share} from "rxjs/operators/share";

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
  const socket = io(socketUrl, socketConfig);

  const socket$ = Observable.create(obs => {
    socket.onAny((...args) => {
      obs.next(args)
    })
  }).pipe(share());

  const io$ = new BehaviorSubject(socket);

  /**
   * *****BACK-COMPAT*******
   * Scripts that come after Browsersync may rely on the previous window.___browserSync___.socket
   */
  window.___browserSync___.socket = socket;

  return {socket$, io$};
}
