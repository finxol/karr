import createNextIntlPlugin from "next-intl/plugin"

import { API_BASE, API_VERSION } from "@karr/config"

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
    devIndicators: false,
    output: "standalone",
    /** Enables hot reloading for local packages without a build step */
    transpilePackages: ["@karr/ui", "@karr/config"],
    outputFileTracingIncludes: {
        "/**/*.css": ["src/assets/**/*.css"]
    },
    env: {
        NEXT_PUBLIC_API_URL: `${API_BASE}/${API_VERSION}`,
        ORY_HYDRA_ADMIN_URL: "http://localhost:4445",
        NEXT_PUBLIC_ORY_KRATOS_URL: "http://localhost:4433"
    },

    experimental: {
        reactCompiler: true
    },

    /** We already do linting and typechecking as separate tasks in CI */
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true }
}

export default withNextIntl(nextConfig)
