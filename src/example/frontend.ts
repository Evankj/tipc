import { createClient } from "..";
import type { MyAPI } from "./common";

const client = createClient<MyAPI>({
  add: {},
});

client.add({ num1: 1, num2: 2 }).then(console.log);
