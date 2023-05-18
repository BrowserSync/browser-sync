import {Page, test as base, Response as PlaywrightResponse} from "@playwright/test";
import {join, relative} from "node:path";
import {fork} from "node:child_process";
import * as z from "zod";

const messageSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal('ready'),
    urls: z.object({
      local: z.string()
    })
  })
])

export const test = base.extend<{
  bsUrl: string;
}>({
  bsUrl: async ({ }, use, testInfo) => {
    const last2 = testInfo.file.split('/').slice(-3, -1);
    const cwd = process.cwd();
    const base = join(cwd, ...last2);
    const file = join(base, 'run.js');

    console.log("running", {
      cwd,
      base: relative(cwd, base),
      file: relative(cwd, file),
      testInfoFile: relative(cwd, testInfo.file)
    })

    const child = fork(file, {
      cwd: base,
      stdio: 'pipe'
    })

    child.stdout.on('data', d => console.log(d.toString()))
    child.stderr.on('data', d => console.error(d.toString()))

    const url = await new Promise<string>((res, rej) => {
      child.on('spawn', (...args) => {
        console.log('✅ spawned');
      })
      child.on('error', (error) => {
        rej(new Error('child process error' + error))
      })
      child.on('message', (message) => {
        console.log('📩 message', message);
        const parsed = messageSchema.safeParse(message);
        if (parsed.success) {
          res(parsed.data.urls.local);
        } else {
          // @ts-expect-error - not sure why this is not working
          rej(new Error('zod parsing error' + parsed.error))
        }
      })
    })

    const closed = new Promise<any>((res, rej) => {
      child.on('exit', (code) => {
        console.log('exit, code: ', code);
      })
      child.on('close', (code) => {
        console.log('[child]: close', code)
        res(code);
      })
      child.on('disconnect', (...args) => {
        console.log('disconnect', ...args)
      })
    })

    await use(url);
    child.kill('SIGTERM')
    await closed;
  },
});

export async function makesRequestFor({pathname, when }: { pathname: string, when: { page: Page, loads: { url: string} }}) {
  const p1 = new Promise(res => {
    when.page.on('request', (r) => {
      const url = new URL(r.url());
      if (url.pathname === pathname) {
        res(url);
      }
    })
  })
  const p2 = when.page.goto(when.loads.url);
  return await Promise.all([p1, p2]);
}

interface ResponseForArgs {
  pathname: string;
  when: { page: Page; loads: { url: string } }
}

export async function responseFor(args: ResponseForArgs): Promise<[body: string, original: PlaywrightResponse]> {
  const { when, pathname } = args
  const p1 = new Promise<Buffer>(res => {
    when.page.on('response', (r) => {
      const url = new URL(r.url());
      if (url.pathname === pathname) {
        res(r.body());
      }
    })
  }).then(x => x.toString())
  const p2 = when.page.goto(when.loads.url);
  return Promise.all([p1, p2]);
}
