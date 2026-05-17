import Elysia, { t } from "elysia";

export default new Elysia()
  .guard({
    params: t.Object({
      id: t.String(),
    }),
  })
  .get("", ({ params: { id } }) => ({
    route: "/users/:id" as const,
    id,
  }));
