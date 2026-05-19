export const accessToken = crypto.randomUUID();

export const users = Array.from({ length: 20 }, (_, id) => ({
  id,
  name: `test-user-${id}`,
}));

export const contacts = Object.fromEntries(
  users.map((_, i) => [
    i,
    Array.from({ length: 20 }, (_, id) => ({
      id,
      phone: "+" + Math.round(Math.random() * 1000000000),
      name: `test-user-${i}-contact-${id}`,
    })),
  ])
);
