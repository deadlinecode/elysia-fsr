import Elysia from "elysia";

import { auth } from "../../../(authed)";

export default new Elysia()
  .use(auth())
  .get("", ({ session: { user } }) => user);
