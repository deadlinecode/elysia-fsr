import { beforeAll, describe, expect, it, test } from "bun:test";
import Elysia from "elysia";
import { fsr } from "../../src/router";

describe("FSR runtime response tests", () => {
  let app: Elysia;
  const req = (path: string) =>
    app.handle(new Request(`http://localhost${path}`)).then((r) => r.json());
  beforeAll(async () => {
    app = new Elysia().use(await fsr({ dir: "test/fixtures/routes" }));
  });

  it('/ should return route "/"', async () => {
    const rsp = await req("/");
    expect(rsp).toMatchObject({
      route: "/",
    });
  });

  it('/root should return route "/root"', async () => {
    const rsp = await req("/root");
    expect(rsp).toMatchObject({
      route: "/root",
    });
  });

  it('/catchall/a should return route "/catchall" and wildcard "a"', async () => {
    const rsp = await req("/catchall/a");
    expect(rsp).toMatchObject({
      route: "/catchall/*",
      wildcard: "a",
    });
  });
  it('/catchall/a/b should return route "/catchall" and wildcard "a/b"', async () => {
    const rsp = await req("/catchall/a/b");
    expect(rsp).toMatchObject({
      route: "/catchall/*",
      wildcard: "a/b",
    });
  });

  it('/users should return route "/users"', async () => {
    const rsp = await req("/users");
    expect(rsp).toMatchObject({
      route: "/users",
    });
  });
  it('/users/1 should return route "/users/:id" and id "1"', async () => {
    const rsp = await req("/users/1");
    expect(rsp).toMatchObject({
      route: "/users/:id",
      id: "1",
    });
  });
});
