export type JSONSerializableType =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JSONSerializableType }
  | JSONSerializableType[];

export type EndpointDefinition<
  ArgumentsType extends any = any,
  ReturnsType extends any = any
> = (...args: ArgumentsType[]) => Promise<ReturnsType>

export type APITypeHelper<
  EndpointArgType,
  EndpointReturnType,
  API extends {
    [EndpointRoute in keyof API extends string ? string : never]: EndpointDefinition<
      {
        [Key in keyof Parameters<API[EndpointRoute]>[0]]: EndpointArgType
      },
      EndpointReturnType>
  }
> = API


export type APIType<
  EndpointArgType,
  EndpointReturnType,
  API extends {
    [EndpointRoute in keyof API]: EndpointDefinition<
      {
        [Key in keyof Parameters<API[EndpointRoute]>[0]]: Parameters<
          API[EndpointRoute]
        >[0][Key] extends EndpointArgType ?
        Parameters<API[EndpointRoute]>[0][Key] :
        EndpointArgType
      },
      EndpointReturnType>
  }
> = API


export type APIDefinition<
  EndpointArgType extends any,
  EndpointReturnType extends any,
  API extends {
    [EndpointRoute in keyof API]: EndpointDefinition<
      {
        [Key in keyof Parameters<API[EndpointRoute]>[0]]: Parameters<
          API[EndpointRoute]
        >[0][Key] extends EndpointArgType ?
        Parameters<API[EndpointRoute]>[0][Key] :
        EndpointArgType
      },
      EndpointReturnType>
  }
> = APIType<EndpointArgType, EndpointReturnType, API>;


type UninitialisedAPIType = APIType<any, any, {
  [key: string]: (...args: any[]) => any
}>


type MiddlewaresObject<ArgumentsType> = {
  [key: string]: (args: ArgumentsType) => any
}

type GenericMiddlewaresObject<ArgumentsType, T extends MiddlewaresObject<ArgumentsType>> = {
  [Key in keyof T]: ReturnType<T[Key]>
};


type APIImplementation<T extends UninitialisedAPIType> = {
  [Endpoint in keyof T]: {
    middlewares: GenericMiddlewaresObject<Parameters<T[Endpoint]>[0], {
      [key: string]: (args: Parameters<T[Endpoint]>[0]) => any
    }>,
    handler: (args: Parameters<T[Endpoint]>[0], context: {
      // This holds all the returned values from the middlewares
      middlewares: {
        [Key in keyof APIImplementation<T>[Endpoint]['middlewares']]:
        ReturnType<APIImplementation<T>[Endpoint]['middlewares'][Key]>
      }
    }) => ReturnType<T[Endpoint]>
  }
}


export function implementAPI<T extends UninitialisedAPIType>(
  implementation: APIImplementation<T>
) {
  return implementation;
}


export function createClient<T extends UninitialisedAPIType>(
  endpoints: {
    [Key in keyof T]: {}
  }
): T {
  let client: Partial<T> = {};

  for (const endpoint of Object.keys(endpoints)) {
    // @ts-ignore
    client[endpoint] = async (
      args: Parameters<T[typeof endpoint]>[0]
    ) => {
      const response = await fetch(`http://localhost:3000/${String(endpoint)}`, {
        method: 'POST',
        body: JSON.stringify(args)
      });
      return (await response.json()) as ReturnType<T[typeof endpoint]>;
    }
  }

  return client as T
}
