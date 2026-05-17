import Elysia, { t } from "elysia";

export default new Elysia().get("", () => ({ route: "/" }));
