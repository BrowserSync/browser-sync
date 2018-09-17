import * as url from 'url';
import {Map} from 'immutable';
import {BrowsersyncProxy} from "../../types";
import {BsTempOptions, TransformResult} from "../cli-options";

export function handleProxyOption(incoming: BsTempOptions): TransformResult {
    let value = incoming.get('proxy');
    let mw;
    let target;

    if (!value || value === true) {
        return [incoming, []];
    }

    if (typeof value !== "string") {
        target = value.get("target");
        mw = value.get("middleware");
    } else {
        target = value;
        value = Map({});
    }

    if (!target.match(/^(https?):\/\//)) {
        target = "http://" + target;
    }

    const parsedUrl = url.parse(target);

    if (!parsedUrl.port) {
        parsedUrl.port = "80";
    }

    const out: BrowsersyncProxy = {
        target: parsedUrl.protocol + "//" + parsedUrl.host,
        url: Map(parsedUrl)
    };

    if (mw) {
        out.middleware = mw;
    }

    const proxyOutput = value.mergeDeep(out);

    return [incoming.set('proxy', proxyOutput), []];
}
