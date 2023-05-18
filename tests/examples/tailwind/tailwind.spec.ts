import { expect } from '@playwright/test';
import { test, responseFor } from "../../utils";

test('startup writes CSS file', async ({page, bsUrl}) => {
  const [body] = await responseFor({
    pathname: "/dist/output.css",
    when: {page, loads: { url: bsUrl }}
  })
  expect(body).toContain(`.p-4 {
  padding: 1rem;
}`);
});
