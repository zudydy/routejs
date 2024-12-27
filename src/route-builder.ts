type ParamsType = Record<string, string>
type QueryType = Record<string, string | number | boolean>

type BaseRoute = {
  getPath(): string
}

type RouteFunction<P, Q> = P extends undefined
  ? Q extends undefined
    ? () => string
    : (params: undefined, query: Q) => string
  : Q extends undefined
    ? (params: P) => string
    : (params: P, query: Q) => string

type Route<P, Q> = RouteFunction<P, Q> & BaseRoute

class RouteBuilder<
  P extends ParamsType | undefined = undefined,
  Q extends QueryType | undefined = undefined,
> {
  private readonly pathTemplate: string

  constructor(path: string) {
    if (!path) throw new Error("Path is required.")
    this.pathTemplate = path
  }

  params<NewP extends ParamsType>() {
    return new RouteBuilder<NewP, Q>(this.pathTemplate)
  }

  query<NewQ extends QueryType>() {
    return new RouteBuilder<P, NewQ>(this.pathTemplate)
  }

  build(): Route<P, Q> {
    const self = this

    const routeFunction = ((params?: P, query?: Q): string => {
      let path = this.replaceParams(self.pathTemplate, params)
      path = this.appendQuery(path, query)
      return path
    }) as Route<P, Q>

    routeFunction.getPath = () => self.getBasePath()

    return routeFunction
  }

  private replaceParams(path: string, params?: P): string {
    if (params) {
      for (const key in params) {
        const placeholder = `:${key}`
        if (!path.includes(placeholder)) {
          throw new Error(`Path is missing parameter: ${key}`)
        }
        path = path.replace(placeholder, encodeURIComponent(params[key]))
      }
    }

    const missingParams = path.match(/:\w+/g)
    if (missingParams) {
      throw new Error(
        `Missing required parameters: ${missingParams.join(", ")}`,
      )
    }

    return path
  }

  private appendQuery(path: string, query?: Q): string {
    if (!query) return path

    const queryString = Object.entries(query)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
      )
      .join("&")

    return queryString ? `${path}?${queryString}` : path
  }

  private getBasePath(): string {
    return this.pathTemplate.replace(/\/:\w+/g, "")
  }
}

export const routeBuilder = () => ({
  path(path: string) {
    return new RouteBuilder(path)
  },
})
