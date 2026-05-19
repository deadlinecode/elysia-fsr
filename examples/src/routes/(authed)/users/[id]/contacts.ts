import Elysia from "elysia";

import { resolveUser } from ".";
import { contacts } from "../../../../data";

export default new Elysia()
  .use(resolveUser())
  .get("", ({ user }) => contacts[user.id]);
