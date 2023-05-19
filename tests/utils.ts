import { Page, test as base, Response as PlaywrightResponse } from "@playwright/test";
import { join, relative } from "node:path";
import { fork, execSync } from "node:child_process";
import * as z from "zod";
// @ts-expect-error
import strip from "strip-ansi";

const messageSchema = z.discriminatedUnion("kind", [
    z.object({
        kind: z.literal("ready"),
        urls: z.object({
            local: z.string(),
            ui: z.string()
        }),
        cwd: z.string()
    })
]);
type Msg = z.infer<typeof messageSchema>;

interface NextArgs {
    stdout: { lines: { count: number; after: number } };
}

export const test = base.extend<{
    bs: {
        url: string;
        cwd: string;
        uiUrl: string;
        child: any;
        stdout: string[];
        touch: (path: string) => void;
        next: (args: NextArgs) => Promise<string[]>;
    };
}>({
    bs: async ({}, use, testInfo) => {
        const last2 = testInfo.file.split("/").slice(-3, -1);
        const cwd = process.cwd();
        const base = join(cwd, ...last2);
        const file = join(base, "run.js");
        const stdout: string[] = [];

        console.log("running", {
            cwd,
            base: relative(cwd, base),
            file: relative(cwd, file),
            testInfoFile: relative(cwd, testInfo.file)
        });

        const child = fork(file, {
            cwd: base,
            stdio: "pipe"
        });

        child.stdout.on("data", d => {
            stdout.push(d.toString());
            // console.log(d.toString());
        });
        child.stderr.on("data", d => console.error(d.toString()));

        const msg = await new Promise<Msg>((res, rej) => {
            child.on("spawn", (...args) => {
                console.log("✅ spawned");
            });
            child.on("error", error => {
                rej(new Error("child process error" + error));
            });
            child.on("message", message => {
                console.log("📩 message", message);
                const parsed = messageSchema.safeParse(message);
                if (parsed.success) {
                    res(parsed.data);
                } else {
                    // @ts-expect-error - not sure why this is not working
                    rej(new Error("zod parsing error" + parsed.error));
                }
            });
        });

        console.log("---", msg.cwd);

        const closed = new Promise<any>((res, rej) => {
            child.on("exit", code => {
                console.log("exit, code: ", code);
            });
            child.on("close", code => {
                console.log("[child]: close", code);
                res(code);
            });
            child.on("disconnect", (...args) => {
                console.log("disconnect", ...args);
            });
        });

        await use({
            url: msg.urls.local,
            uiUrl: msg.urls.ui,
            cwd: msg.cwd,
            child,
            stdout,
            touch: (path: string) => {
                touchFile(join(msg.cwd, path));
            },
            next: async (args: NextArgs) => {
                const {
                    stdout: { lines }
                } = args;
                return new Promise<string[]>((res, rej) => {
                    const timeout = setTimeout(() => {
                        clearTimeout(timeout);
                        clearInterval(int);
                        rej(new Error("timeout"));
                    }, 2000);
                    const int = setInterval(() => {
                        if (stdout.length > lines.after) {
                            const dif = stdout.length - lines.after;
                            if (dif >= lines.count) {
                                const next = stdout.slice(lines.after).map(line => {
                                    return strip(line);
                                });
                                res(next);
                                clearInterval(int);
                            }
                        }
                    }, 100);
                });
            }
        });

        child.kill("SIGTERM");

        await closed;
    }
});

interface RequestForArgs {
    matches:
        | {
              url: (url: URL) => boolean;
          }
        | {
              pathname: string;
          };
    when?: {
        pageLoads: {
            url: string;
        };
    };
}

export function makesRequestIn(page: Page, args: RequestForArgs) {
    const { matches, when } = args;

    if ("pathname" in matches) {
        const requestPromise = new Promise(res => {
            page.on("request", r => {
                const url = new URL(r.url());
                if (url.pathname === matches.pathname) {
                    res(url);
                }
            });
        });
        const jobs = [requestPromise];
        if (when) {
            jobs.push(page.goto(when.pageLoads.url));
        }
        const good = Promise.all(jobs);
        return Promise.race([
            good,
            timeout({ msg: "waiting for request timed out: " + matches.pathname })
        ]);
    }

    if ("url" in matches) {
        const requestPromise = new Promise(res => {
            page.on("request", r => {
                const url = new URL(r.url());
                if (matches.url(url)) {
                    res(url);
                }
            });
        });

        return Promise.race([requestPromise, timeout({ msg: "waiting for request timed out" })]);
    }
}

interface ResponseForArgs {
    pathname: string;
    when: { page: Page; loads: { url: string } };
}

export async function responseFor(args: ResponseForArgs) {
    const { when, pathname } = args;
    const responseBody = new Promise<Buffer>(res => {
        when.page.on("response", r => {
            const url = new URL(r.url());
            if (url.pathname === pathname) {
                res(r.body());
            }
        });
    }).then(x => x.toString());

    const load = when.page.goto(when.loads.url);
    const good = Promise.all([responseBody, load]);
    return Promise.race([good, timeout({ msg: "waiting for response timed out: " + pathname })]);
}

function timeout({ ms, msg }: { ms?: number; msg?: string } = {}): Promise<never> {
    return new Promise((res, rej) =>
        setTimeout(() => rej(new Error(msg || "timedout")), ms ?? 2000)
    );
}

function touchFile(filePath) {
    execSync(`touch ${filePath}`);
}
