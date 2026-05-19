import Elysia from "elysia";

export default new Elysia().get("", () => ({
  route: "/(scoped)/scoped/scoped-test",
}));
