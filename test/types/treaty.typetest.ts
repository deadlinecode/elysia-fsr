import { treaty } from "@elysiajs/eden";

import type { App } from "../fixtures/routes";

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? (<T>() => T extends B ? 1 : 2) extends <T>() => T extends A ? 1 : 2
      ? true
      : false
    : false;

const client = treaty<App>("http://localhost");

const test = <R extends string, A, B>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  route: R,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  expect: A,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fx: () => Promise<{
    data: B;
  }>
): Equal<A, NonNullable<B>> extends true
  ? { run: () => void }
  : {
      error: `test failed: route ${R} did not return correct type`;
      expected: A;
      got: NonNullable<B>;
    } => {
  return null as any;
};

test(
  "/users/1",
  {
    route: "/users/:id" as const,
    id: "1",
  },
  () => client.users({ id: "1" }).get()
).run();
