# elysia-fsr

> A file system based router for elysia with generated eden compatible route types

## Features

- 📂 File-system based routes
- 🔑 Index routes
- ✨ Dynamic params with `[id]`
- 🎯 Catch-all routes with `[...]`
- 👻 Ghost route groups with `(group)`
- 📝 Generated `routes.d.ts` app types compatible with eden
- 🔥 Bun-native calls for fast fs operations

## Installation

```sh
bun add elysia-fsr
```

## Quick start

Start with this

```ts
// File: src/index.ts
import Elysia from "elysia";
import { fsr } from "elysia-fsr";

// If you only want to use the file router
const app = (await fsr()).listen(3000, ({ url }) =>
  console.log(`Server is running on ${url}`)
);

// or just use it like any other elysia plugin
const app = new Elysia()
  .use(await fsr())
  .listen(3000, ({ url }) => console.log(`Server is running on ${url}`));
```

then put a file into the routes folder and default export your elysia instance

```ts
// File: src/routes/index.ts
import Elysia from "elysia";

export default new Elysia().get("", () => "Hello there uwu");
```

Calling "http://localhost:3000/" should now return the text.

You can of course also configure the plugin via some options

```ts
import Elysia from "elysia";
import fsr, { LogLevel } from "elysia-fsr";

const app = new Elysia()
  .use(
    await fsr({
      // the directory to scan for routes
      dir: "./custom-routes-folder",
      // the filter to use to find route files
      // useful if you want to ignore specific files or directories
      // for example if you want to use all files except files that start with schema.ts you can use this:
      // filter: "**/!(*schema).ts",
      filter: "**/*.{ts,tsx,js,jsx,mjs,cjs}",
      // the log level to use
      logLevel: LogLevel.Silent,
      // type gen options
      types: {
        // the directory to write the types to
        dir: "./custom-types-folder",
        // the import alias to use for importing the route files
        // this is useful if you use workspaces and want the types to be generated into your frontend
        // but have the backend installed via workspace linking
        importAlias: "import-route-files-alias",
      },
    })
  )
  .listen(3000);
```

To use the generated routes.d.ts file with eden do this

```ts
import { treaty } from "@elysiajs/eden";

import type { App } from "../routes";

// path to your routes.d.ts file

const client = treaty<App>("http://localhost");

// Success 0o0
const response = await client.get();
```

> A fully working example can be found inside [the examples folder](./examples/README.md)

## General rules / plugin options

- The default routes dir is "./routes" (relative to the main module/file e.g. `dirname(Bun.main)`)
- If the routes directory does not exist the plugin will create it
- Default filter is `**/*.{ts,tsx,js,jsx,mjs,cjs}` (so all files with the endings ts,tsx,js,jsx,mjs,cjs)
- By default the generation of types is enabled and the file is emitted in the same folder as the routes folder lives (e.g. by default `src/routes.d.ts`)
- You can turn off type gen by setting types: false
- If you wish to generate the routes file in another folder you can use the types.dir option
  - You can also use the types.importAlias option to set your own routes root (useful for monorepos with workspaces or if you like to use tsconfig alias imports instead of relative imports)
- There are 3 levels of logging:
  - Silent - Logs only errors (for example when a route cant be imported because of a logic error in a file)
  - Default - Logs infos, warnings and errors
  - Verbose - Logs everything (including stuff you don't really need)
- Since log levels are controlled via enums you can supply the value -2 to really have no logs including errors
- By default the package logs something similar to this to help you spot problems immediately (looks even better in console):

  ```
  [ELYSIA-FSR] scanning routes in test/fixtures/routes
  [ELYSIA-FSR:scan] scan complete: 10 loaded, 0 skipped, 0 errors
  [ELYSIA-FSR:tree] route tree:
  └─ / (index.ts) - root
    ├─ /root (root.ts) - static
    ├─ /(scoped) ((scoped).ts,(scoped)/index.ts) - ghost
    │  └─ /scoped  - static
    │     └─ /scoped-test ((scoped)/scoped/scoped-test.ts) - static
    ├─ /scoped  - static
    │  └─ /non-scoped-test (scoped/non-scoped-test.ts) - static
    ├─ /catchall  - static
    │  └─ /* (catchall/[...].ts) - wildcard
    └─ /users (users/index.ts) - static
        ├─ /:id (users/[id].ts) - param
        └─ /test (users/test.ts) - static

  [ELYSIA-FSR] types emitted to test/fixtures/routes.d.ts
  ```

## Supported file routes

### Normal routes (duh!)

- `src/routes/test.ts` -> `/test`
- `src/routes/this/is/a/test` -> `/this/is/a/test`

### Index routes

- `src/routes/index.ts` -> `/`
- `src/routes/test/index.ts` -> `/test`

## Param routes

- `src/routes/users/[id].ts` -> `/users/:id`
- `src/routes/users/[id]/contacts/[number].ts` -> `/users/:id/contacts/:number`

> Note: To have type safety and validation inside handlers use [.guard](https://elysiajs.com/essential/validation.html#guard) or [the config object of a elysia handler](https://elysiajs.com/essential/validation.html#params) to check for the actual parameter

### Wildcard routes

> （╯°□°）╯︵◓ - Gotta catch 'em all
> This will actually match everything after the wildcard in the path including "/"

- `src/routes/catch-all/[...].ts` -> `/catch-all/*`
  - This will match also stuff like `/catch-all/a/b` and give you a param with key "\*" and value "a/b"

### Ghosts (pathless routes / groups)

- `src/routes/api/(authed)/test.ts` -> `/api/test`
- Every ghost route (e.g. route name in parentheses) will not be used in the final path
- While this looks like nothing it actually creates a scoped instance which means you can guard routes with it
  - If you create the file `src/routes/api/(authed).ts` and use for example a resolve handler on this it will "guard" every route in the `(authed)` folder
  - A example of this can be found in the [examples folder](./examples/README.md)

## Found a bug? IMPOSSIBLE!!!

I don't make mistakes xD

If you still think you found something that does not work as expected you can of course open a issue and even open a PR.
If you submit a PR that fixes a issue make sure to link it in the PR so everyone has a better time browsing this repo :3

## Known issues / TODO

- [ ] Add some more type tests (especially for ghost routes)
- [ ] Add pipelines
  - [ ] Add publish pipeline
  - [ ] Add pipeline to check compatibility with new elysia versions
  - [ ] Add pipeline for type checks, format checks and linting
- [ ] Add file listener for dev mode to catch when a file is created
- [ ] Emitted types could be better for ghost routes. Currently we have intersection types that have duplicated keys. While this works it could be prettier.
- [ ] Possible future support for optional path segments (idk if this even works)
- [ ] Add a interactive github pages site

## Begging for money

The house doesn't feed itself or smth. While i do maintain this project in my free time and provide this package free of charge i don't mind if you have a buck or two you don't need. I am always happy about a tiny donation uwu

[paypal.me/deadlinecode](https://paypal.me/deadlinecode)

## AI disclaimer

No ai was used for writing the actual code of this package.
I partly used ai for the file structure since i am horrible with clean folder/file structures/organizing.
