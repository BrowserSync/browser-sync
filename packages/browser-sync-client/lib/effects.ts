import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { setOptionsEffect } from "./effects/set-options.effect";
import { fileReloadEffect } from "./effects/file-reload.effect";
import { browserSetLocationEffect } from "./effects/browser-set-location.effect";
import { simulateClickEffect } from "./effects/simulate-click.effect";
import { setElementValueEffect } from "./effects/set-element-value.effect";
import { setElementToggleValueEffect } from "./effects/set-element-toggle-value.effect";
import { setScrollEffect } from "./effects/set-scroll";
import { browserReloadEffect } from "./effects/browser-reload.effect";

export enum EffectNames {
    FileReload = "@@FileReload",
    PreBrowserReload = "@@PreBrowserReload",
    BrowserReload = "@@BrowserReload",
    BrowserSetLocation = "@@BrowserSetLocation",
    BrowserSetScroll = "@@BrowserSetScroll",
    SetOptions = "@@SetOptions",
    SimulateClick = "@@SimulateClick",
    SetElementValue = "@@SetElementValue",
    SetElementToggleValue = "@@SetElementToggleValue"
}

export const effectOutputHandlers$ = new BehaviorSubject({
    [EffectNames.SetOptions]: setOptionsEffect,
    [EffectNames.FileReload]: fileReloadEffect,
    [EffectNames.BrowserReload]: browserReloadEffect,
    [EffectNames.BrowserSetLocation]: browserSetLocationEffect,
    [EffectNames.SimulateClick]: simulateClickEffect,
    [EffectNames.SetElementValue]: setElementValueEffect,
    [EffectNames.SetElementToggleValue]: setElementToggleValueEffect,
    [EffectNames.BrowserSetScroll]: setScrollEffect
});
