import type { APIDefinition, JSONSerializableType } from ".."


export type MyAPI = APIDefinition<JSONSerializableType, JSONSerializableType, {
  add: (_: {
    num1: number,
    num2: number
  }) => Promise<number>,
}>
