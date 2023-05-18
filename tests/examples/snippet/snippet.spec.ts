import { expect } from "@playwright/test";
import { makesRequestIn, test } from "../../utils";

test("Snippet works", async ({ page, bs }) => {
    await makesRequestIn(page, {
        matches: { pathname: "/browser-sync/socket.io/" },
        when: { pageLoads: { url: bs.url } }
    });
});

test("Gives correct terminal output for file watching", async ({ page, bs }) => {
    await page.goto(bs.url);
    const prevCount = bs.stdout.length;
    await bs.touch("index.html");
    const stdout = await bs.next({ stdout: { lines: { count: 1, after: prevCount } } });
    expect(stdout).toContain("[Browsersync] Reloading Browsers...\n");
});
