import { expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { makesRequestIn, responseFor, test } from "../../utils";

test.describe("html-inject", () => {
    test("injecting HTML", async ({ page, bs }) => {
        await page.goto(bs.url);

        // fill the form field
        await page.getByLabel('Name:').fill('shane');

        // read the original contents
        const original = readFileSync(join(bs.cwd, 'index.html'), 'utf8');

        // fake the response to indicate a HTML change on disk
        await page.route('**', (route, req) => {
            const url = new URL(req.url());
            if (url.pathname === '/') {
                return route.fulfill({
                    body: original.replace('Name:', 'FirstName:'),
                    status: 200,
                    contentType: "text/html"
                })
            }
            return route.continue()
        });

        // wait for the request to happen
        const request = makesRequestIn(page, {
            matches: {
                pathname: "/"
            }
        });

        // simulate the file-change
        await bs.touch("index.html");

        // wait for BS to re-request the file
        await request;

        // now ensure the Label was updated + the form values are still present
        await expect(page.getByLabel('FirstName:')).toHaveValue('shane', {timeout: 1000});
    });
})
