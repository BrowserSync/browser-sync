import {Map} from 'immutable';
import {PortsOption} from "../../types";
import {BsTempOptions, TransformResult} from "../cli-options";

export function handlePortsOption(incoming: BsTempOptions): TransformResult {
    const value = incoming.get('ports');
    if (!value) return [incoming, []];

    const obj: PortsOption = {min: null, max: null};

    if (typeof value === "string") {
        if (~value.indexOf(",")) {
            const segs = value.split(",");
            obj.min = parseInt(segs[0], 10);
            obj.max = parseInt(segs[1], 10);
        } else {
            obj.min = parseInt(value, 10);
            obj.max = null;
        }
    } else {
        obj.min = value.get("min");
        obj.max = value.get("max") || null;
    }

    return [incoming.set('ports', Map(obj)), []];
}
