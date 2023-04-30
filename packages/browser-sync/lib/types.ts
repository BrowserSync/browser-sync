import { Map } from "immutable";
import { z } from "zod";

export type ServerIncoming = string | string[] | IServerOption;

export interface IServerOption {
    baseDir: string[];
    index?: string;
    directory?: boolean;
    serveStaticOptions?: any;
    routes?: { [route: string]: string };
    middleware?: MiddlewareInput;
}

export type MiddlewareInput = Function | Function[] | Middleware | Middleware[];

export interface Middleware {
    route: string;
    id?: string;
    handle: Function;
}

export type BrowsersyncProxyIncoming = string | BrowsersyncProxy;
export interface BrowsersyncProxy {
    target: string;
    url: Map<string, any>;
    middleware?: MiddlewareInput;
}

export type PortsOption = {
    min: number | null;
    max: number | null;
};

export type FilesObject = { match: string[]; fn?: Function; options?: any };
export type FilesNamespace = { globs: string[]; objs: FilesObject[]; index?: number };
export type FilesNamespaces = { [name: string]: FilesNamespace };

export type RunnerOption = {
    files: string[];
    run: Runner[];
};

// prettier-ignore
export type Runner =
  | { sh: { cmd: string } }
  | { sh: string }
  | { bs: "reload" }
  | { bs: "inject"; files: string[] }
  | { npm: string[], parallel?: boolean }

const runnerParser = z.union([
    z.object({
        sh: z.string()
    }),
    z.object({
        bs: z.literal("reload")
    }),
    z.object({
        bs: z.literal("inject"),
        files: z.array(z.string())
    }),
    z.object({
        npm: z.array(z.string()),
        parallel: z.boolean().optional()
    })
]);

export const runnerOption = z.object({
    files: z.array(z.string()),
    run: z.array(runnerParser)
});

export function toRunnerOption(input: unknown): RunnerOption | null {
    const parsed = runnerOption.safeParse(input);
    return parsed.success ? parsed.data : null;
}

// prettier-ignore
export type BsSideEffect =
  | { type: "reload"; files: any[] }
  | { type: "inject"; files: {path: string, event: string}[] }

const sideEffectParser = z.discriminatedUnion("type", [
    z.object({ type: z.literal("reload"), files: z.array(z.any()) }),
    z.object({ type: z.literal("inject"), files: z.array(z.any()) })
]);

export function toSideEffect(sideEffect: BsSideEffect): BsSideEffect {
    return sideEffectParser.parse(sideEffect);
}

// prettier-ignore
export type RunnerNotification =
  | { status: 'start'; effects: BsSideEffect[]; runner: Runner }
  | { status: 'end'; effects: BsSideEffect[]; runner: Runner }

const notificationParser = z.discriminatedUnion("status", [
    z.object({
        runner: runnerParser,
        status: z.literal("start"),
        effects: z.array(sideEffectParser)
    }),
    z.object({ runner: runnerParser, status: z.literal("end"), effects: z.array(sideEffectParser) })
]);

export function toRunnerNotification(input: RunnerNotification): RunnerNotification {
    return notificationParser.parse(input);
}

///

const fileChangedEventParser = z.object({
    event: z.string(),
    path: z.string(),
    log: z.boolean().optional(),
    namespace: z.string(),
    index: z.number().optional()
});

export type FileChangedEvent = z.infer<typeof fileChangedEventParser>;

export function toChangeEvent(evt: FileChangedEvent): FileChangedEvent {
    return fileChangedEventParser.parse(evt);
}

/// Browser Reload Event

const browserReloadEvent = z.object({
    files: z.array(z.string())
});

export type ReloadEvent = z.infer<typeof browserReloadEvent>;

export function toReloadEvent(reload: ReloadEvent): ReloadEvent {
    return browserReloadEvent.parse(reload);
}

/// Inject File info

const injectFileInfo = z.object({
    ext: z.string(),
    path: z.string(),
    basename: z.string(),
    event: z.unknown(), // You may want to replace this with a more specific type
    type: z.enum(["inject", "reload"]),
    url: z.string().optional(),
    log: z.unknown() // You may want to replace this with a more specific type
});

export type InjectFileInfo = z.infer<typeof injectFileInfo>;
