import Elysia, { t } from "elysia";

export default new Elysia()
  .guard({
    params: t.Object({
      "*": t.String(),
    }),
  })
  .get("", ({ params }) => ({
    route: "/catchall/*",
    wildcard: params["*"],
  }));
