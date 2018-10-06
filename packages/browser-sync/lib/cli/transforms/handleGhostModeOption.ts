import {fromJS} from "immutable";
import {BsTempOptions, TransformResult} from "../cli-options";

export function handleGhostModeOption(incoming: BsTempOptions): TransformResult {
    const value = incoming.get('ghostMode');
    var trueAll = {
        clicks: true,
        scroll: true,
        forms: {
            submit: true,
            inputs: true,
            toggles: true
        }
    };

    var falseAll = {
        clicks: false,
        scroll: false,
        forms: {
            submit: false,
            inputs: false,
            toggles: false
        }
    };

    if (
        value === false ||
        value === "false"
    ) {
        return [incoming.set('ghostMode', fromJS(falseAll)), []];
    }

    if (
        value === true ||
        value === "true"
    ) {
        return [incoming.set('ghostMode', fromJS(trueAll)), []];
    }

    if (value.get("forms") === false) {
        return [incoming.set('ghostMode', value.withMutations(function (map) {
            map.set(
                "forms",
                fromJS({
                    submit: false,
                    inputs: false,
                    toggles: false
                })
            );
        })), []];
    }

    if (value.get("forms") === true) {
        return [incoming.set('ghostMode', value.withMutations(function (map) {
            map.set(
                "forms",
                fromJS({
                    submit: true,
                    inputs: true,
                    toggles: true
                })
            );
        })), []];
    }

    return [incoming, []];
}
