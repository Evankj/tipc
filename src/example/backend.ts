import { Hono } from "hono";
import { tipc } from "..";
import type { MyAPI } from "./common";

const app = tipc.withContext<{
  exampleMessage: string,
  exampleDate: Date,
  req: Request,
}>().implement<MyAPI>({
  handlers: {
    obj: async ({
      test
    }) => {
      return test.a + test.b;
    },

    file: async ({
      input
    }) => {
      return await input.text();
    },
    add: async ({
      num1,
      num2
    }, {
      req // We can get things from the context
    }) => {
      console.log(req);
      return num1 + num2;
    },
    echo: async ({ message }, { exampleMessage: test }) => {
      return `${message} ${test}`;
    }
  },

  contextInitialiser: async (req: Request) => {
    return {
      exampleMessage: "this is a test",
      exampleDate: new Date(),
      req
    }
  }

});


// ---- HTTP POST API implementation ----
// const api = new Hono();
//
// for (const endpoint of Object.keys(app.handlers)) {
//   api.post(endpoint, async (c) => {
//     const data = await c.req.json();
//     const path = endpoint as keyof MyAPI;
//     const context = await app.contextInitialiser(c.req.raw);
//     const result = await app.handlers[path](data, context);
//     return c.json(result);
//   });
// }
//
// api.notFound(async (c) => {
//   // const result = await app.default({ attemptedEndpoint: c.req.url });
//   return c.json("NOT FOUND", 404);
// });
//
// export default api;


// ---- HTTP POST API multipart form implementation ----
const api = new Hono();

for (const endpoint of Object.keys(app.handlers)) {
  api.post(endpoint, async (c) => {
    const data = await c.req.formData();
    const path = endpoint as keyof MyAPI;
    const context = await app.contextInitialiser(c.req.raw);
    type Key = keyof typeof app.handlers;
    const endpointKey = endpoint as Key;

    let payload = {} as Parameters<typeof app.handlers[typeof endpointKey]>[0];

    data.forEach((field, key) => {
      const value = typeof field === "string" ? JSON.parse(field) : field;
      // @ts-ignore
      payload[key] = value;
    })

    // @ts-ignore
    const result = await app.handlers[path](payload, context);
    return c.json(result);
  });
}

api.notFound(async (c) => {
  return c.json("NOT FOUND", 404);
});

export default api;
