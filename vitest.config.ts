import swc from "unplugin-swc"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    root: "./",
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
