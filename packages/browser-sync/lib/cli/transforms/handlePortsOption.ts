import { Map } from "immutable";
import { PortsOption } from "../../types";
import { BsTempOptions, TransformResult } from "../cli-options";

export function handlePortsOption(incoming: BsTempOptions): TransformResult {
    const value = incoming.get("ports");
    if (!value) return [incoming, []];

    const obj: PortsOption = { min: null, max: null };

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
        if (Map.isMap(value)) {
            obj.min = (value.get("min") as number) ?? null;
            obj.max = (value.get("max") as number | undefined) || null;
        } else {
            const o = value as { min?: number; max?: number | null };
            obj.min = o.min != null ? o.min : null;
            obj.max = o.max != null ? o.max : null;
        }
    }

    return [incoming.set("ports", Map(obj)), []];
}
