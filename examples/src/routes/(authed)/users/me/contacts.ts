import Elysia from "elysia";

import { auth } from "../../../(authed)";
import { contacts } from "../../../../data";

export default new Elysia()
  .use(auth())
  .get("", ({ session: { user } }) => contacts[user.id]);
