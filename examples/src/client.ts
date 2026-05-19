import { treaty } from "@elysiajs/eden";

import type { App } from "./routes";

const client = treaty<App>("http://localhost:3000/api");

const handleResponse = async <T>(
  path: string,
  method: string,
  fx: () => Promise<{ data: any; status: number; error: any }>
): Promise<T> => {
  console.log(`>> ${path} [${method}]`);
  const rsp = await fx();
  console.log(
    `<< ${path} [${method}]:\nstatus: ${rsp.status}\nresponse: ${JSON.stringify({ data: rsp.data, error: rsp.error }, null, 2)}`
  );
  console.log();
  return rsp.data;
};

await handleResponse("/", "GET", () => client.get());

const { accessToken } = await handleResponse<{ accessToken: string }>(
  "/login",
  "POST",
  () => client.login.post({ password: "super-secret-password" })
);

const headers = {
  authorization: "Bearer " + accessToken,
};

await handleResponse("/users (unauthed)", "GET", () => client.users.get());

await handleResponse("/users", "GET", () =>
  client.users.get({
    headers,
  })
);

await handleResponse("/users/me", "GET", () =>
  client.users.me.get({
    headers,
  })
);

await handleResponse("/users/1/contacts", "GET", () =>
  client.users({ id: 1 }).contacts.get({
    headers,
  })
);
