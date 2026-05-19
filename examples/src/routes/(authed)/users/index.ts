import Elysia from "elysia";

import { users } from "../../../data";

export default new Elysia().get("", () => users);
