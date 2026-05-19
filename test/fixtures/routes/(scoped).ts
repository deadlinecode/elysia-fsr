import Elysia from "elysia";

export default new Elysia().resolve(({ headers }) => {
  const token = headers["token"];

  if (token !== "123") throw new Response('{"msg": "no token found"}');

  return {};
});
