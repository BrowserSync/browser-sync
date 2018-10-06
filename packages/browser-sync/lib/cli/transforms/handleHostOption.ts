import {BsTempOptions, TransformResult} from "../cli-options";
import {BsErrorLevels, BsErrorTypes} from "../../bin";

export function handleHostOption(incoming: BsTempOptions): TransformResult {
    const host: string|null = incoming.get("host");
    const listen: string|null = incoming.get("listen");

    if (host && listen) {
        if (host !== listen) {
            return [incoming, [{
                errors: [
                    {
                        error: new Error("Cannot specify both `host` and `listen` options"),
                        meta() {
                            return [
                                "",
                                "Tip:           Use just the `listen` option *only* if you want to bind only to a particular host.",
                            ]
                        }
                    }
                ],
                level: BsErrorLevels.Fatal,
                type: BsErrorTypes.HostAndListenIncompatible
            }]];
        }

        // whenever we have have both `host` + `listen` options,
        // we remove the 'host' to prevent complication further down the line
        return [
            incoming.delete('host'),
        []];
    }

    return [incoming, []];
}
