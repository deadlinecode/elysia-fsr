import { beforeAll, describe, expect, it } from "bun:test";
import Elysia from "elysia";

import { fsr } from "../../src/router";

describe("FSR runtime response tests", () => {
  let app: Elysia;
  const req = (path: string, options?: { headers?: Record<string, string> }) =>
    app
      .handle(
        new Request(`http://localhost${path}`, { headers: options?.headers })
      )
      .then((r) => r.text())
      .then((txt) => {
        try {
          return JSON.parse(txt);
        } catch {
          return txt;
        }
      });
  beforeAll(async () => {
    app = new Elysia().use(await fsr({ dir: "../fixtures/routes" }));
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

  it('/scoped/non-scoped-test should return route "/scoped/non-scoped-test"', async () => {
    const rsp = await req("/scoped/non-scoped-test");
    expect(rsp).toMatchObject({
      route: "/scoped/non-scoped-test",
    });
  });
  it('/scoped/scoped-test without token header should return msg "no token found"', async () => {
    const rsp = await req("/scoped/scoped-test");
    expect(rsp).toMatchObject({
      msg: "no token found",
    });
  });
  it('/scoped/scoped-test with token header should return route "/(scoped)/scoped/scoped-test"', async () => {
    const rsp = await req("/scoped/scoped-test", { headers: { token: "123" } });
    expect(rsp).toMatchObject({
      route: "/(scoped)/scoped/scoped-test",
    });
  });
  it('/test without token header should return msg "no token found"', async () => {
    const rsp = await req("/test");
    expect(rsp).toMatchObject({
      msg: "no token found",
    });
  });
  it('/test with token header should return route "/(scoped)/index/test"', async () => {
    const rsp = await req("/test", { headers: { token: "123" } });
    expect(rsp).toMatchObject({
      route: "/(scoped)/index/test",
    });
  });
});
