import { createFormClient } from "../../src";
import type { MyAPI } from "./common";

const client = createFormClient<MyAPI>("http://localhost:3000/");



client.add({ num1: 1, num2: 2 }).then(console.log);
client.echo({ message: "Hello from client" }).then(console.log);

const file = new File(["test"], "fileNAME.txt");
client.file({
  input: file
}).then(console.log)

client.obj({
  test: {
    a: 100,
    b: 25
  }
}).then(console.log)
