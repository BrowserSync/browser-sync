import {makesRequestFor, test} from "../../utils"

test('Snippet works', async ({page, bsUrl}) => {
  await makesRequestFor({
    pathname: "/browser-sync/socket.io/",
    when: { page, loads: { url: bsUrl } }
  })
});
