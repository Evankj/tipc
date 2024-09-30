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




type APIImplementation<T extends UninitialisedAPIType, Context extends object> = {

  contextInitialiser: (...args: any[]) => Promise<Context>;

  handlers: {
    [Endpoint in keyof T]: (args: Parameters<T[Endpoint]>[0], ctx: Context) => ReturnType<T[Endpoint]>;
  };

}

class TIPC<Context extends object = {}> {

  withContext<Context extends object>() {
    return new TIPC<Context>();
  }

  implement<API extends UninitialisedAPIType>(implementation: APIImplementation<API, Context>) {
    return implementation;
  }
}

export const tipc = new TIPC();

export function implementAPI<API extends UninitialisedAPIType, Middlewares extends {
  [Key: string]: () => Promise<any>
}>(
  handlers: APIImplementation<API, Middlewares>,
  middlewares?: Middlewares
) {
  return {
    handlers,
    middlewares
  };
}

// TODO: Generalise this so that it can be reimplemented easily for other transport layers (i.e. not only HTTP) 
export function createClient<T extends UninitialisedAPIType>(baseUrl: string): T {

  const url = new URL(baseUrl);

  const handler = {
    get(_: any, endpoint: string) {
      return async (
        args: Parameters<T[typeof endpoint]>[0]
      ) => {
        const response = await fetch(new URL(String(endpoint), url), {
          method: 'POST',
          body: JSON.stringify(args)
        });
        return (await response.json()) as ReturnType<T[typeof endpoint]>;
      }
    }
  }

  const clientProxy = new Proxy<T>({} as T, handler);

  return clientProxy
}


// This is an example showing how we can also send files over HTTP as a 
// multipart form but keep the same interface and ergonomics
export function createFormClient<T extends UninitialisedAPIType>(baseUrl: string): T {

  const url = new URL(baseUrl);

  const handler = {
    get(_: any, endpoint: string) {


      return async (
        args: Parameters<T[typeof endpoint]>[0]
      ) => {

        const formData = new FormData();
        Object.entries(args).forEach(([key, val]) => {
          let value;
          if (!(val instanceof File)) {
            value = JSON.stringify(val) as string;
            formData.append(key, value);
          } else {
            value = val as File;
            formData.append(key, value, value.name);
          }
        })

        const response = await fetch(new URL(String(endpoint), url), {
          method: 'POST',
          body: formData
        });
        return (await response.json()) as ReturnType<T[typeof endpoint]>;
      }
    }
  }

  const clientProxy = new Proxy<T>({} as T, handler);

  return clientProxy
}
