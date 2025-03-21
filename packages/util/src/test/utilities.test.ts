import { describe, expect, it } from "vitest"

import { toCamelCase } from "@/utilities.js"

describe("toCamelCase", () => {
    it("should return a given string in camel case", () => {
        expect(toCamelCase("Hello World")).toBe("helloWorld")
        expect(toCamelCase("helloWorld")).toBe("helloWorld")
        expect(toCamelCase("HelloWorld")).toBe("helloWorld")
    })
})
