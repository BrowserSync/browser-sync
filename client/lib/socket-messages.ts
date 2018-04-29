import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { withLatestFrom } from "rxjs/operators/withLatestFrom";
import { ignoreElements } from "rxjs/operators/ignoreElements";
import { tap } from "rxjs/operators/tap";
import { pluck } from "rxjs/operators/pluck";
import { incomingScrollHandler } from "./messages/ScrollEvent";
import { incomingHandler$ } from "./messages/ClickEvent";
import { incomingKeyupHandler } from "./messages/KeyupEvent";
import { incomingBrowserNotify } from "./messages/BrowserNotify";
import { incomingBrowserLocation } from "./messages/BrowserLocation";
import { incomingBrowserReload } from "./messages/BrowserReload";
import { incomingFileReload } from "./messages/FileReload";
import { incomingConnection } from "./messages/Connection";
import { incomingDisconnect } from "./messages/Disconnect";
import { incomingInputsToggles } from "./messages/FormToggleEvent";
import { incomingOptionsSet } from "./messages/OptionsSet";

export enum IncomingSocketNames {
    Connection = "connection",
    Disconnect = "disconnect",
    FileReload = "file:reload",
    BrowserReload = "browser:reload",
    BrowserLocation = "browser:location",
    BrowserNotify = "browser:notify",
    Scroll = "scroll",
    Click = "click",
    Keyup = "input:text",
    InputToggle = "input:toggles",
    OptionsSet = "options:set"
}

export enum OutgoingSocketEvents {
    Scroll = "@@outgoing/scroll",
    Click = "@@outgoing/click",
    Keyup = "@@outgoing/keyup",
    InputToggle = "@@outgoing/Toggle"
}

export type SocketEvent = [IncomingSocketNames, any];
export type OutgoingSocketEvent = [OutgoingSocketEvents, any];

export const socketHandlers$ = new BehaviorSubject({
    [IncomingSocketNames.Connection]: incomingConnection,
    [IncomingSocketNames.Disconnect]: incomingDisconnect,
    [IncomingSocketNames.FileReload]: incomingFileReload,
    [IncomingSocketNames.BrowserReload]: incomingBrowserReload,
    [IncomingSocketNames.BrowserLocation]: incomingBrowserLocation,
    [IncomingSocketNames.BrowserNotify]: incomingBrowserNotify,
    [IncomingSocketNames.Scroll]: incomingScrollHandler,
    [IncomingSocketNames.Click]: incomingHandler$,
    [IncomingSocketNames.Keyup]: incomingKeyupHandler,
    [IncomingSocketNames.InputToggle]: incomingInputsToggles,
    [IncomingSocketNames.OptionsSet]: incomingOptionsSet,
    [OutgoingSocketEvents.Scroll]: emitWithPathname(IncomingSocketNames.Scroll),
    [OutgoingSocketEvents.Click]: emitWithPathname(IncomingSocketNames.Click),
    [OutgoingSocketEvents.Keyup]: emitWithPathname(IncomingSocketNames.Keyup),
    [OutgoingSocketEvents.InputToggle]: emitWithPathname(
        IncomingSocketNames.InputToggle
    )
});

function emitWithPathname(name) {
    return function(xs, inputs) {
        return xs.pipe(
            withLatestFrom(
                inputs.io$,
                inputs.window$.pipe(pluck("location", "pathname"))
            ),
            tap(([event, io, pathname]) =>
                io.emit(name, { ...event, pathname })
            ),
            ignoreElements()
        );
    };
}
