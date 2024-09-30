# **T**yped **I**nter **P**rocess **C**ommunication

This is library is my take on a simple TRPC like system with my preferences reflected:

1. Define the API surface as a type (using helper types) and have the compiler/IDE help you implement it.
2. Minimal change in semantics for defining your API "endpoints" (just write a TypeScript function definition)\*
3. Keep it simple so that implementing backend handlers and frontend clients for different transport layers is quick and easy.

> \* Currently, you need to define the arguments for your function inside an object (this is because this library uses the `Parameters` utility type and needs to be able to refer to the arguments by their keys). Here's an example of how to define your endpoints with minimal syntax: `createUser: (_: {userName: string, email: string}) => Promise<number>`
