import swc from "unplugin-swc"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    include: ["**/*.e2e-spec.ts"],
    globals: true,
    root: "./",
    setupFiles: ["./test/setup-e2e.ts"],
    // O beforeAll do setup roda `prisma migrate deploy` num spawn; o cold start
    // (pnpm + engine do Prisma) passa fácil do timeout padrão de 10s.
    hookTimeout: 60_000,
  },
  resolve: {
    tsconfigPaths: true,
  },
  // O SWC faz o emitDecoratorMetadata que o DI do Nest precisa; desligamos o
  // transform padrão do Oxc para o swc cuidar de tudo.
  oxc: false,
  plugins: [
    swc.vite({
      module: { type: "es6" },
    }),
  ],
})
