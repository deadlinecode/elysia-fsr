import Elysia from "elysia";

export default new Elysia().get("", () => ({
  err: {
    status: 404,
    msg: "not found",
  },
}));
