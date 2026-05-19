import Elysia from "elysia";

export default new Elysia().get("/test", () => ({
  route: "/(scoped)/index/test",
}));
