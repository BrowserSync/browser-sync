import { expect } from "@playwright/test";
import { makesRequestIn, responseFor, test } from "../../utils";

test.describe("basic", () => {
    test("file reloading when .css changes", async ({ page, bs }) => {
        await page.goto(bs.url);
        const request = makesRequestIn(page, {
            matches: {
                url: url => {
                    return url.searchParams.has("browsersync");
                }
            }
        });
        await bs.touch("**/style.css");
        await request;
    });
    test("file reloading when HTTP received", async ({ page, bs }) => {
        await page.goto(bs.url);
        const request = makesRequestIn(page, {
            matches: {
                url: url => {
                    return url.searchParams.has("browsersync");
                }
            }
        });
        const url = new URL("__browser_sync__", bs.url);
        await fetch(url.toString(), {
            method: "POST",
            body: JSON.stringify([
                "file:reload",
                {
                    ext: "css",
                    path: "*.css",
                    basename: "*/*.css",
                    event: "change",
                    type: "inject",
                    log: true
                }
            ]),
            headers: {
                "content-type": "application/json"
            }
        });
        await request;
    });
    test("can import 1 stylesheet from <style>@import</style>", async ({ page, bs }) => {
        await page.goto(bs.url + "/import.html");

        // make sure the search param is absent to prevent false
        const href = await page.evaluate(() => {
            const firstStyle = document.getElementsByTagName("style")[0];
            // @ts-expect-error
            return firstStyle.sheet.cssRules[0].href;
        });
        expect(href).not.toContain("browsersync");

        // now change a file
        bs.touch("assets/import.css");

        // eventually, the css file should be updated
        await page.waitForFunction(() => {
            const firstStyle = document.getElementsByTagName("style")[0];
            // @ts-expect-error
            return firstStyle.sheet.cssRules[0].href.includes("?browsersync");
        });
    });
    test.skip("can import nested from nested @import rules", async ({ page, bs }) => {
        await page.goto(bs.url + "/import-link.html");

        // make sure the search param is absent to prevent false
        const href = await page.evaluate(() => {
            // @ts-expect-error
            return document.styleSheets[0].cssRules[0].href;
        });
        expect(href).not.toContain("browsersync");

        // now change a file
        bs.touch("assets/import2.css");

        // eventually, the css file should be updated
        await page.waitForFunction(() => {
            // @ts-expect-error
            const link = document.getElementsByTagName("link")?.[0].sheet?.cssRules?.[0].href;
            return (link || "").includes("?browsersync");
        });
    });
    test("should reload single <img src>", async ({ page, bs }) => {
        await page.goto(bs.url + "/images.html");

        const request = makesRequestIn(page, {
            matches: {
                url: url => {
                    return url.searchParams.has("browsersync");
                }
            }
        });

        // now change a file
        bs.touch("**/cam-secure.png");
        await request;

        const img = await page.$("img");
        expect(await img.getAttribute("src")).toContain("?browsersync");

        // eventually, the img file should be updated
        const elem2 = await page.$('[id="img-style"]');
        const style = await elem2.getAttribute("style");
        expect(style).not.toContain("?browsersync");
    });
    test("should reload single style backgroundImage style property", async ({ page, bs }) => {
        await page.goto(bs.url + "/images.html");

        const request = makesRequestIn(page, {
            matches: {
                url: url => {
                    return url.searchParams.has("browsersync");
                }
            }
        });

        // now change a file
        bs.touch("**/cam-secure-02.png");
        await request;

        const img = await page.$("img");
        expect(await img.getAttribute("src")).not.toContain("?browsersync");

        const elem2 = await page.$('[id="img-style"]');
        const style = await elem2.getAttribute("style");
        expect(style).toContain("?browsersync");
    });
    test("should reload both images", async ({ page, bs }) => {
        await page.goto(bs.url + "/images.html");

        const request = makesRequestIn(page, {
            matches: {
                url: url => {
                    return url.searchParams.has("browsersync");
                }
            }
        });

        // now change a file
        bs.touch("**/*.png");
        await request;

        const img = await page.$("img");
        expect(await img.getAttribute("src")).toContain("?browsersync");

        const elem2 = await page.$('[id="img-style"]');
        const style = await elem2.getAttribute("style");
        expect(style).toContain("?browsersync");
    });
});

test.describe("UI", () => {
    test("remote debugger", async ({ context, page, bs }) => {
        await page.goto(bs.url);
        const request = makesRequestIn(page, {
            matches: {
                pathname: "/browser-sync/pesticide.css"
            }
        });

        // open the UI
        const ui = await context.newPage();
        await ui.goto(bs.uiUrl);
        await ui.getByRole("button", { name: "Remote Debug" }).click();
        await ui
            .locator("label")
            .first()
            .click();

        // back to the main page
        await page.bringToFront();

        // ensure the CSS file was requested
        await request;
    });
});

test.describe("Overlays", () => {
    test("should flash Connected message", async ({ context, page, bs }) => {
        await page.goto(bs.url);
        await page.locator("#__bs_notify__").waitFor({ timeout: 5000 });
    });
});
