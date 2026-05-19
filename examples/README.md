# elysia-fsr - Real world example (kinda)

> This example should demonstrate how a real world example would work for a api with authentication
> It also should contain most if not all use cases of this package

## Start the server

```
bun dev
```

## Request some routes and see results

> Uses eden treaty - see [`src/client.ts`](src/client.ts)

```
bun req
```

## How the api works

If you want to test the api on your own here are the routes:

- `GET /`
  - returns api name and version
- `POST /login` - body: `{ "password": "super-secret-password" }`
  - returns body: `{ "accessToken": "<token>" }`
  - use this in subsequent requests to authenticate via headers: `{ "authorization": "Bearer <token>" }`
- `GET /users`
  - returns list of users
- `GET /users/me`
  - returns current user
- `GET /users/me/contacts`
  - returns current user's contacts
- `GET /users/:id`
  - returns user by id
- `GET /users/:id/contacts`
  - returns user's contacts by id
- `/*` (wildcard match)
  - returns 404

Feel free to throw fake credentials or stuff against the api. It should respond with the correct error codes.

Also you can see from the code that everything inside the (authed) folder is protected by the resolve in [`src/routes/(authed).ts`](<src/routes/(authed).ts>).

You can also see how i setup the resolve as plugin with `.as("scoped")` and a name option. This is so that i can use it in other files to have the type safety. The name option is super duper important since it allows elysia to dedupe plugin calls so the plugin only gets called one time instead of twice for routes like `/users`
