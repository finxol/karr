import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

export default defineConfig({
    test: {
        environment: "node",
        include: ["src/test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        watch: false
    },
    plugins: [tsconfigPaths()]
})
