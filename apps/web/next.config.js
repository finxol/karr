import { API_BASE, API_VERSION } from "@karr/config"

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    /** Enables hot reloading for local packages without a build step */
    transpilePackages: ["@karr/ui", "@karr/config"],
    outputFileTracingIncludes: {
        "/**/*.css": ["src/assets/**/*.css"]
    },
    env: {
        NEXT_PUBLIC_API_ROUTE: `${API_BASE}/${API_VERSION}`
    },

    experimental: {
        reactCompiler: true
    },

    /** We already do linting and typechecking as separate tasks in CI */
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true }
}

export default nextConfig
