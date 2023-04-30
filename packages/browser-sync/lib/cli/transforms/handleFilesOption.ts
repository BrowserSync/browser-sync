import { fromJS, List } from "immutable";
import { BsTempOptions, makeFilesArg, TransformResult } from "../cli-options";
import { FilesNamespace, FilesNamespaces, runnerOption } from "../../types";
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
    const parsed = parser.safeParse(incoming.get("runners").toJS());
    if (!parsed.success) {
        // todo: what to do in this case?
        console.log("failed to parse input", parsed.error);
        return null;
    }
    const runnerData = parsed.data;
    const output: FilesNamespaces = {};

    runnerData.forEach((runner, index) => {
        const next: FilesNamespace = {
            index,
            globs: [],
            objs: []
        };
        runner.files.forEach(fileOption => {
            if (typeof fileOption === "string") {
                next.globs.push(fileOption);
            }
        });
        output["__unstable_runner_" + index] = next;
    });
    return output;
}
