import Elysia, { t } from "elysia";

import { accessToken } from "../data";

export default new Elysia().post(
  "",
  ({ body: { password }, set }) => {
    if (password !== "super-secret-password") {
      set.status = 401;
      return {
        err: {
          status: 401,
          msg: "unauthorized",
        },
      };
    }
    return {
      accessToken,
    };
  },
  {
    body: t.Object({
      password: t.String(),
    }),
  }
);
