import { routeBuilder } from "./route-builder"

describe("routeBuilder", () => {
  it("should build a route without params or query", () => {
    const route = routeBuilder().path("/home").build()
    expect(route()).toBe("/home")
  })

  it("should replace params in the path", () => {
    const route = routeBuilder()
      .path("/users/:id")
      .params<{ id: string }>()
      .build()
    expect(route({ id: "123" })).toBe("/users/123")
  })

  it("should throw an error if extra params are provided", () => {
    const route = routeBuilder()
      .path("/users/:id")
      .params<{ id: string }>()
      .build()
    expect(() => route({ id: "123", extra: "extra" } as any)).toThrow(
      "Path is missing parameter: extra",
    )
  })

  it("should append query string to the path", () => {
    const route = routeBuilder()
      .path("/search")
      .query<{ q: string; page: number }>()
      .build()
    expect(route(undefined, { q: "test", page: 2 })).toBe(
      "/search?q=test&page=2",
    )
  })

  it("should handle both params and query string", () => {
    const route = routeBuilder()
      .path("/users/:id/details")
      .params<{ id: string }>()
      .query<{ show: boolean }>()
      .build()
    expect(route({ id: "123" }, { show: true })).toBe(
      "/users/123/details?show=true",
    )
  })

  it("should throw an error if path is empty", () => {
    expect(() => routeBuilder().path("").build()).toThrow("Path is required.")
  })

  it("should return the base path with getPath()", () => {
    const route = routeBuilder()
      .path("/users/:id/details")
      .params<{ id: string }>()
      .build()
    expect(route.getPath()).toBe("/users/details")
  })

  it("should encode params and query values", () => {
    const route = routeBuilder()
      .path("/search/:term")
      .params<{ term: string }>()
      .query<{ q: string }>()
      .build()
    expect(route({ term: "special term" }, { q: "value with spaces" })).toBe(
      "/search/special%20term?q=value%20with%20spaces",
    )
  })

  it("should handle optional query parameters", () => {
    const route = routeBuilder()
      .path("/products")
      .query<{ category?: string; page?: number }>()
      .build()
    expect(route(undefined, { category: "electronics" })).toBe(
      "/products?category=electronics",
    )
    expect(route(undefined, { page: 2 })).toBe("/products?page=2")
    expect(route(undefined, {})).toBe("/products")
  })
})
