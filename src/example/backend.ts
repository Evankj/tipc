import { Hono } from "hono";
import { implementAPI } from "..";
import type { MyAPI } from "./common";

const app = implementAPI<MyAPI>({

  add: async (
    { args, request }
  ) => {
    return args.num1 + args.num2
  },

  multiply: async ({
    args,
  }) => {
    return args.num1 * args.num2
  },

  echo: async ({
    args
  }) => {
    return args.message
  },

  default: async (args) => {
    return 'default'
  }
});


const api = new Hono();

for (const endpoint of Object.keys(app)) {
  api.post(endpoint, async (c) => {
    const data = await c.req.json();
    const path = endpoint as keyof MyAPI;
    const result = await app[path]({ args: data, request: c.req.raw });
    return c.json(result);
  });
}

api.notFound(async (c) => {
  const result = await app.default({ attemptedEndpoint: c.req.url });
  return c.json("DEFAULT", 404);
});

export default api;
