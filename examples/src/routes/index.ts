import Elysia from "elysia";

import pkg from "../../../package.json";

export default new Elysia().get("", () => ({
  name: pkg.name,
  version: pkg.version,
}));
