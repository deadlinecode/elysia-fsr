import Elysia from "elysia";

import { accessToken, users } from "../data";

export const auth = () =>
  new Elysia({
    name: "auth-plugin",
  })
    .resolve(({ headers: { authorization }, set }) => {
      if (!authorization || authorization.split(" ").at(-1) !== accessToken) {
        set.status = 403;
        set.headers["content-type"] = "application/json";
        throw new Response(
          JSON.stringify({
            err: {
              status: 403,
              msg: "forbidden",
            },
          })
        );
      }

      return {
        session: {
          user: users[0]!,
        },
      };
    })
    .as("scoped");

export default new Elysia().use(auth());
