import type { APIDefinition, JSONSerializableType } from ".."

export type MyAPI = APIDefinition<JSONSerializableType | File | {
  [key: string]: JSONSerializableType | File
}, JSONSerializableType, {

  add: (_: {
    num1: number,
    num2: number
  }) => Promise<number>,

  obj: (_: {
    test: {
      a: number,
      b: number
    }
  }) => Promise<number>

  echo: (_: {
    message: string
  }) => Promise<string>

  file: (_: {
    input: File
  }) => Promise<string>
}>
