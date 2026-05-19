import Elysia from "elysia";

import { fsr } from "../../src";

new Elysia({ prefix: "/api" })
  .use(await fsr({ dir: "src/routes" }))
  .listen(3000, ({ url }) => console.log(`Listening on ${url}api`));
