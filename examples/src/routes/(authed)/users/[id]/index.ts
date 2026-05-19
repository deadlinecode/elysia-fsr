import Elysia, { t } from "elysia";

import { users } from "../../../../data";

export const resolveUser = () =>
  new Elysia({ name: "resolve-user-plugin" })
    .guard({
      params: t.Object({
        id: t.Number(),
      }),
    })
    .resolve(({ params: { id }, set }) => {
      const user = users.find((user) => user.id === id);
      if (!user) {
        set.status = 404;
        set.headers["content-type"] = "application/json";
        throw new Response(
          JSON.stringify({
            err: {
              status: 404,
              msg: "not found",
            },
          })
        );
      }

      return { user };
    })
    .as("scoped");

export default new Elysia().use(resolveUser()).get("", ({ user }) => user);
