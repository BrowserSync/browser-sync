import { fromJS, List } from "immutable";
import { BsTempOptions, makeFilesArg, TransformResult } from "../cli-options";
import { FilesNamespace, FilesNamespaces, runnerOption, runtimeRunnerOption } from "../../types";
import { z } from "zod";

export function handleFilesOption(incoming: BsTempOptions): TransformResult {
    const namespaces: FilesNamespaces = {
        core: {
            globs: [],
            objs: []
        }
    };

    const processed = makeFilesArg(incoming.get("files"));

    if (processed.globs.length) {
        namespaces.core.globs = processed.globs;
    }

    if (processed.objs.length) {
        namespaces.core.objs = processed.objs;
    }

    const runners = convertRunnerOption(incoming);

    return [incoming.set("files", fromJS({ ...namespaces, ...runners })), []];
}

export function convertRunnerOption(incoming: BsTempOptions): FilesNamespaces | null {
    const runners = incoming.has("runners");
    if (!runners) return null;

    const parser = z.array(runnerOption);
    const incomingOpt = incoming.get("runners").toJS();
    const runnerData = parser.parse(incomingOpt);
    const output: FilesNamespaces = {};

    runnerData.forEach((runner, index) => {
        if (runner.at !== "runtime") return;
        const next: FilesNamespace = {
            index,
            globs: [],
            objs: []
        };
        for (let whenElement of runner.when) {
            if ("files" in whenElement) {
                whenElement.files.forEach(fileOption => {
                    next.globs.push(fileOption);
                });
                output["__unstable_runner_" + index] = next;
            } else {
                throw new Error("unreachable - only when.files supported currently");
            }
        }
    });
    return output;
}
