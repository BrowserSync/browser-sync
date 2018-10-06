import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { propSetDomEffect } from "./dom-effects/prop-set.dom-effect";
import { styleSetDomEffect } from "./dom-effects/style-set.dom-effect";
import { linkReplaceDomEffect } from "./dom-effects/link-replace.dom-effect";
import { setScrollDomEffect } from "./dom-effects/set-scroll.dom-effect";
import { setWindowNameDomEffect } from "./dom-effects/set-window-name.dom-effect";

export enum Events {
    PropSet = "@@BSDOM.Events.PropSet",
    StyleSet = "@@BSDOM.Events.StyleSet",
    LinkReplace = "@@BSDOM.Events.LinkReplace",
    SetScroll = "@@BSDOM.Events.SetScroll",
    SetWindowName = "@@BSDOM.Events.SetWindowName"
}

export const domHandlers$ = new BehaviorSubject({
    [Events.PropSet]: propSetDomEffect,
    [Events.StyleSet]: styleSetDomEffect,
    [Events.LinkReplace]: linkReplaceDomEffect,
    [Events.SetScroll]: setScrollDomEffect,
    [Events.SetWindowName]: setWindowNameDomEffect
});
