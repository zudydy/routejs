import { hello } from "./index"

test("typed-route", () => {
  expect(hello()).toBe("typed-route!")
})
